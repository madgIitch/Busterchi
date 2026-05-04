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

  const frameMs = mode === "idle" ? 160 : mode === "sleeping" ? 200 : 95;

  useEffect(() => {
    if (reducedMotion || frames.length <= 1) {
      return;
    }
    const id = window.setInterval(() => {
      setFrameIndex((index) => (index + 1) % frames.length);
    }, frameMs);
    return () => window.clearInterval(id);
  }, [frames.length, frameMs, reducedMotion]);

  const src = reducedMotion
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
