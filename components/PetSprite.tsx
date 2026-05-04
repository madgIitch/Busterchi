"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_PET_DIRECTION,
  getPetFrames,
  getPetRotation,
  PET_FALLBACK_FRAME,
  PET_SLEEP_FRAME,
  type PetAnimationMode,
  type PetDirection,
} from "@/lib/petAnimations";

type Props = {
  mode: PetAnimationMode;
  direction: PetDirection;
  isSleeping: boolean;
  reducedMotion?: boolean;
};

export default function PetSprite({
  mode,
  direction,
  isSleeping,
  reducedMotion = false,
}: Props) {
  const [frameIndex, setFrameIndex] = useState(0);
  const frames = useMemo(
    () => getPetFrames(mode, direction || DEFAULT_PET_DIRECTION),
    [direction, mode],
  );

  useEffect(() => {
    setFrameIndex(0);
  }, [direction, mode, isSleeping, reducedMotion]);

  useEffect(() => {
    if (isSleeping || reducedMotion || frames.length <= 1) {
      return;
    }
    const id = window.setInterval(() => {
      setFrameIndex((index) => (index + 1) % frames.length);
    }, mode === "idle" ? 160 : 95);
    return () => window.clearInterval(id);
  }, [frames.length, isSleeping, mode, reducedMotion]);

  const src = isSleeping
    ? PET_SLEEP_FRAME
    : reducedMotion
      ? getPetRotation(direction)
      : frames[frameIndex] ?? getPetRotation(direction) ?? PET_FALLBACK_FRAME;

  return (
    <img
      src={src}
      alt={isSleeping ? "Buster sleeping" : "Buster"}
      className="pet-sprite h-auto w-full"
      draggable={false}
    />
  );
}
