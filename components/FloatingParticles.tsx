"use client";

import { useEffect, useMemo } from "react";

type Props = {
  emojis: string[];
  originX: number;
  originY: number;
  onDone: () => void;
};

export default function FloatingParticles({
  emojis,
  originX,
  originY,
  onDone,
}: Props) {
  const positions = useMemo(
    () =>
      emojis.map((emoji) => ({
        emoji,
        x: originX + Math.random() * 40 - 20,
        y: originY,
      })),
    [emojis, originX, originY],
  );

  useEffect(() => {
    const id = window.setTimeout(onDone, 900);
    return () => window.clearTimeout(id);
  }, [onDone]);

  return (
    <>
      {positions.map((particle, index) => (
        <span
          key={`${particle.emoji}-${index}`}
          className="particle"
          style={{
            left: particle.x,
            top: particle.y,
            animationDelay: `${index * 60}ms`,
          }}
          aria-hidden="true"
        >
          {particle.emoji}
        </span>
      ))}
    </>
  );
}
