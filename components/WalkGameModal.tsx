"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { CARD_CATALOG } from "@/lib/encounters/cards";
import { ENEMY_DECKS } from "@/lib/encounters/enemies";
import type { CardDefinition } from "@/lib/encounters/types";
import WalkCard from "./WalkCard";
import {
  createCombatState,
  drawCards,
  endTurn,
  playCard,
} from "@/combat";

export default function WalkGameModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const getCardSizeClassName = (card: CardDefinition) => {
    if (card.cost >= 3) {
      return "h-[170px]";
    }
    return "h-[150px]";
  };
  const [state, setState] = useState(() => {
    const starterDeck = CARD_CATALOG.slice(0, 12);
    const enemy = ENEMY_DECKS[0];
    return createCombatState(starterDeck, enemy);
  });

  const hand = useMemo(() => state.hand, [state.hand]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40">
      <div className="h-[100svh] w-full bg-background px-3 py-3">
        <div className="fit-screen flex h-full flex-col gap-3">
          <header className="flex items-center justify-between border-b border-black/10 px-1 py-2">
            <h2 className="text-lg font-normal">Paseo</h2>
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-background text-text shadow-sm shadow-black/10"
              aria-label="Cerrar paseo"
            >
              X
            </button>
          </header>

          <section className="rounded-[28px] bg-[linear-gradient(135deg,rgba(255,255,255,0.45),rgba(255,168,183,0.35))] p-3 shadow-lg shadow-black/15">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] border-2 border-white/50">
              <Image
                src="/scenes/Hospital.png"
                alt=""
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 420px"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/15" />
              <Image
                src="/pet/buster_idle.png"
                alt="Buster"
                width={48}
                height={36}
                className="absolute bottom-[2%] left-[20%] h-auto w-[clamp(36px,11vw,55px)] -translate-x-1/2 idle-float"
                priority
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-muted">
              <div className="rounded-full bg-background/80 px-3 py-1 shadow-sm shadow-black/10">
                Energia: {state.player.energy}/{state.player.maxEnergy}
              </div>
              <div className="rounded-full bg-background/80 px-3 py-1 shadow-sm shadow-black/10">
                Animo: {state.player.mood}
              </div>
              <div className="rounded-full bg-background/80 px-3 py-1 shadow-sm shadow-black/10">
                Estres: {state.player.stress}
              </div>
              <div className="rounded-full bg-background/80 px-3 py-1 shadow-sm shadow-black/10">
                Ritmo: {state.player.rhythm}
              </div>
              <div className="rounded-full bg-background/80 px-3 py-1 shadow-sm shadow-black/10">
                Calma: {state.player.calm}
              </div>
              <div className="rounded-full bg-background/80 px-3 py-1 shadow-sm shadow-black/10">
                Confusion: {state.player.confusion}
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-surface p-3 text-xs">
            <p className="text-muted">
              Enemigo: {state.enemy.id} · Vida: {state.enemy.hp}
            </p>
            <p>
              Turno: {state.turn} ·{" "}
              {state.phase === "A"
                ? "Tú atacas primero"
                : "El enemigo ataca primero"}
            </p>
          </section>

          <section className="grid min-h-0 flex-1 grid-cols-2 gap-3 overflow-y-auto pb-2 sm:grid-cols-4">
            {hand.map((card, index) => (
              <WalkCard
                key={`${card.id}-${index}`}
                card={card}
                sizeClassName={getCardSizeClassName(card)}
                onPlay={() => {
                  setState((prev) => {
                    const next = { ...prev };
                    playCard(next, card.id);
                    return { ...next };
                  });
                }}
              />
            ))}
          </section>

          <section className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setState((prev) => {
                  const next = { ...prev };
                  endTurn(next);
                  return { ...next };
                })
              }
              className="flex-1 rounded-full bg-[var(--color-primary)] px-3 py-2 text-xs text-text"
            >
              Terminar turno
            </button>
            <button
              type="button"
              onClick={() =>
                setState((prev) => {
                  const next = { ...prev };
                  drawCards(next, 1);
                  return { ...next };
                })
              }
              className="rounded-full bg-background px-3 py-2 text-xs text-text"
            >
              Robar
            </button>
          </section>

          <section className="rounded-2xl bg-surface p-2 text-[10px] text-muted">
            <div className="max-h-20 overflow-y-auto space-y-1">
              {state.log.slice(-6).map((entry, index) => (
                <div key={`${entry}-${index}`}>{entry}</div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
