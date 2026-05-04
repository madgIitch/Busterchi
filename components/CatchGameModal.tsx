"use client";

import { useEffect, useRef, useState } from "react";

type FallingItem = {
  id: number;
  emoji: string;
  x: number;
  y: number;
  speed: number;
};

type Phase = "idle" | "playing" | "done";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onReward: (bucksters: number, xp: number) => void;
};

const SNACKS = ["🦴", "🍖", "🐟", "🍪"];
const GAME_SECONDS = 30;
const MAX_MISSES = 5;

export default function CatchGameModal({ isOpen, onClose, onReward }: Props) {
  const [items, setItems] = useState<FallingItem[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const nextId = useRef(1);
  const rewarded = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setItems([]);
    setPhase("idle");
    setScore(0);
    setMisses(0);
    setTimeLeft(GAME_SECONDS);
    nextId.current = 1;
    rewarded.current = false;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || phase !== "playing") {
      return;
    }

    const gameLoop = window.setInterval(() => {
      setItems((current) => {
        let missed = 0;
        const next = current
          .map((item) => ({ ...item, y: item.y + item.speed }))
          .filter((item) => {
            const isVisible = item.y < 100;
            if (!isVisible) {
              missed += 1;
            }
            return isVisible;
          });
        if (missed > 0) {
          setMisses((value) => Math.min(MAX_MISSES, value + missed));
        }
        return next;
      });
    }, 50);

    const spawnLoop = window.setInterval(() => {
      setItems((current) => [
        ...current,
        {
          id: nextId.current++,
          emoji: SNACKS[Math.floor(Math.random() * SNACKS.length)],
          x: 8 + Math.random() * 84,
          y: -8,
          speed: 1.5 + Math.random() * 1.5,
        },
      ]);
    }, 1200);

    const timer = window.setInterval(() => {
      setTimeLeft((value) => Math.max(0, value - 1));
    }, 1000);

    return () => {
      window.clearInterval(gameLoop);
      window.clearInterval(spawnLoop);
      window.clearInterval(timer);
    };
  }, [isOpen, phase]);

  useEffect(() => {
    if (phase !== "playing") {
      return;
    }
    if (timeLeft <= 0 || misses >= MAX_MISSES) {
      setPhase("done");
      setItems([]);
    }
  }, [misses, phase, timeLeft]);

  useEffect(() => {
    if (phase !== "done" || rewarded.current) {
      return;
    }
    rewarded.current = true;
    onReward(Math.min(15, Math.floor(score / 3)), score * 2);
  }, [onReward, phase, score]);

  if (!isOpen) {
    return null;
  }

  const bucksterReward = Math.min(15, Math.floor(score / 3));
  const xpReward = score * 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-3xl bg-background p-4 text-text shadow-lg shadow-black/30">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-normal">Atrapa el Snack</h2>
            <p className="text-[11px] text-muted">
              {score} puntos · {misses}/{MAX_MISSES} fallos · {timeLeft}s
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-surface text-sm shadow-sm shadow-black/10"
            aria-label="Cerrar juego"
          >
            X
          </button>
        </header>

        <div className="relative mt-4 aspect-4/5 overflow-hidden rounded-2xl border-2 border-white/50 bg-surface/70 shadow-inner">
          {phase === "idle" ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                type="button"
                onClick={() => setPhase("playing")}
                className="rounded-full bg-primary px-5 py-3 text-sm text-text shadow-sm shadow-black/15"
              >
                Empezar
              </button>
            </div>
          ) : null}

          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setItems((current) =>
                  current.filter((candidate) => candidate.id !== item.id),
                );
                setScore((value) => value + 1);
              }}
              className="absolute flex min-h-11 min-w-11 items-center justify-center p-2 text-4xl leading-none"
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                transform: "translate(-50%, -50%)",
              }}
              aria-label="Atrapar snack"
            >
              {item.emoji}
            </button>
          ))}

          {phase === "done" ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/85 p-4 text-center">
              <div className="text-xl">Score: {score}</div>
              <div className="text-xs text-muted">
                +{bucksterReward} Bucksters · +{xpReward} XP
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-primary px-5 py-3 text-sm text-text shadow-sm shadow-black/15"
              >
                Listo
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
