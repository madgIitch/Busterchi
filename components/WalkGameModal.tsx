"use client";

import { useMemo, useState } from "react";
import { CARD_CATALOG } from "@/lib/encounters/cards";
import { ENEMY_DECKS } from "@/lib/encounters/enemies";
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

          <section className="grid grid-cols-3 gap-2 text-[10px] text-muted">
            <div className="rounded-2xl bg-surface p-2 text-center">
              Energia: {state.player.energy}/{state.player.maxEnergy}
            </div>
            <div className="rounded-2xl bg-surface p-2 text-center">
              Animo: {state.player.mood}
            </div>
            <div className="rounded-2xl bg-surface p-2 text-center">
              Estres: {state.player.stress}
            </div>
            <div className="rounded-2xl bg-surface p-2 text-center">
              Ritmo: {state.player.rhythm}
            </div>
            <div className="rounded-2xl bg-surface p-2 text-center">
              Calma: {state.player.calm}
            </div>
            <div className="rounded-2xl bg-surface p-2 text-center">
              Confusion: {state.player.confusion}
            </div>
          </section>

          <section className="rounded-3xl bg-surface p-3 text-xs">
            <p className="text-muted">Enemigo: {state.enemy.id}</p>
            <p>
              Turno: {state.turn} ·{" "}
              {state.phase === "A"
                ? "Tú atacas primero"
                : "El enemigo ataca primero"}
            </p>
          </section>

          <section className="grid flex-1 grid-cols-2 gap-2 overflow-y-auto">
            {hand.map((card, index) => (
              <button
                key={`${card.id}-${index}`}
                type="button"
                onClick={() => {
                  setState((prev) => {
                    const next = { ...prev };
                    playCard(next, card.id);
                    return { ...next };
                  });
                }}
                className="rounded-2xl bg-background p-2 text-left text-xs shadow-sm shadow-black/10"
              >
                <div className="text-[10px] text-muted">
                  {card.element.toUpperCase()} · {card.cost}
                </div>
                <div className="mt-1">{card.name}</div>
              </button>
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
