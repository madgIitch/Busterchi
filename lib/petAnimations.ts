export const PET_DIRECTIONS = [
  "south",
  "south-east",
  "east",
  "north-east",
  "north",
  "north-west",
  "west",
  "south-west",
] as const;

export type PetDirection = (typeof PET_DIRECTIONS)[number];

export type PetAnimationMode = "idle" | "walk" | "bark" | "jump" | "sleeping" | "sleeping_loop";

type DirectionFrames = Record<PetDirection, string[]>;

const PET_ROOT = "/pet";

const buildRotation = (direction: PetDirection) =>
  `${PET_ROOT}/rotations/${direction}.png`;

const buildFrames = (
  animationId: string,
  frameCount: number,
): DirectionFrames =>
  PET_DIRECTIONS.reduce((frames, direction) => {
    frames[direction] = Array.from(
      { length: frameCount },
      (_, index) =>
        `${PET_ROOT}/animations/${animationId}/${direction}/frame_${String(
          index,
        ).padStart(3, "0")}.png`,
    );
    return frames;
  }, {} as DirectionFrames);

// For animations that only have a south-facing sprite (sleeping)
const buildFramesSouthOnly = (
  animationId: string,
  frameCount: number,
  startFrame = 0,
): DirectionFrames =>
  PET_DIRECTIONS.reduce((frames, direction) => {
    frames[direction] = Array.from(
      { length: frameCount },
      (_, index) =>
        `${PET_ROOT}/animations/${animationId}/south/frame_${String(
          index + startFrame,
        ).padStart(3, "0")}.png`,
    );
    return frames;
  }, {} as DirectionFrames);

export const PET_ROTATIONS: Record<PetDirection, string> =
  PET_DIRECTIONS.reduce((rotations, direction) => {
    rotations[direction] = buildRotation(direction);
    return rotations;
  }, {} as Record<PetDirection, string>);

export const PET_ANIMATIONS: Record<PetAnimationMode, DirectionFrames> = {
  idle: buildFrames("idle", 8),
  walk: buildFrames("walking", 4),
  bark: buildFrames("bark", 6),
  jump: buildFrames("junping", 9),
  sleeping: buildFramesSouthOnly("sleeping", 5),
  sleeping_loop: buildFramesSouthOnly("sleeping bucle", 5, 4),
};

export const PET_FALLBACK_FRAME = "/pet/buster_idle.png";
export const PET_SLEEP_FRAME = "/pet/buster_sleep.png";
export const DEFAULT_PET_DIRECTION: PetDirection = "east";

const DIRECTION_INDEX = PET_DIRECTIONS.reduce((indexes, direction, index) => {
  indexes[direction] = index;
  return indexes;
}, {} as Record<PetDirection, number>);

export function getPetFrames(
  mode: PetAnimationMode,
  direction: PetDirection,
): string[] {
  return (
    PET_ANIMATIONS[mode]?.[direction] ??
    PET_ANIMATIONS.idle[direction] ??
    [PET_ROTATIONS[direction] ?? PET_FALLBACK_FRAME]
  );
}

export function getPetRotation(direction: PetDirection): string {
  return PET_ROTATIONS[direction] ?? PET_ROTATIONS.east ?? PET_FALLBACK_FRAME;
}

export function getDirectionFromDelta(
  deltaX: number,
  deltaY: number,
): PetDirection {
  if (Math.abs(deltaX) < 2 && Math.abs(deltaY) < 2) {
    return DEFAULT_PET_DIRECTION;
  }

  if (Math.abs(deltaX) < 4) {
    return deltaY > 0 ? "south" : "north";
  }
  if (Math.abs(deltaY) < 4) {
    return deltaX > 0 ? "east" : "west";
  }

  if (deltaY > 0 && deltaX > 0) {
    return "south-east";
  }
  if (deltaY > 0 && deltaX < 0) {
    return "south-west";
  }
  if (deltaY < 0 && deltaX > 0) {
    return "north-east";
  }
  return "north-west";
}

export function getDirectionTurnPath(
  from: PetDirection,
  to: PetDirection,
): PetDirection[] {
  if (from === to) {
    return [];
  }

  const totalDirections = PET_DIRECTIONS.length;
  const fromIndex = DIRECTION_INDEX[from];
  const toIndex = DIRECTION_INDEX[to];
  const clockwiseSteps =
    (toIndex - fromIndex + totalDirections) % totalDirections;
  const counterClockwiseSteps =
    (fromIndex - toIndex + totalDirections) % totalDirections;
  const step = clockwiseSteps <= counterClockwiseSteps ? 1 : -1;
  const steps = Math.min(clockwiseSteps, counterClockwiseSteps);

  return Array.from({ length: steps }, (_, index) => {
    const nextIndex =
      (fromIndex + step * (index + 1) + totalDirections) % totalDirections;
    return PET_DIRECTIONS[nextIndex];
  });
}
