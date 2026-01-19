"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { CARD_CATALOG } from "@/lib/encounters/cards";
import { ENEMY_DECKS } from "@/lib/encounters/enemies";
import type { CardDefinition, EnemyDeck } from "@/lib/encounters/types";
import WalkCard from "./WalkCard";
import { createCombatState, endTurn, playCard } from "@/combat";
import { useShopStore } from "@/store/useShopStore";

type WalkGameSessionProps = {
  starterDeck: CardDefinition[];
  enemy: EnemyDeck;
  onClose: () => void;
};

function WalkGameSession({
  starterDeck,
  enemy,
  onClose,
}: WalkGameSessionProps) {
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const getCardSizeClassName = (card: CardDefinition) => {
    if (card.cost >= 3) {
      return "h-[170px]";
    }
    return "h-[150px]";
  };
  const [state, setState] = useState(() =>
    createCombatState(starterDeck, enemy),
  );

  const hand = useMemo(() => state.hand, [state.hand]);

  return (
    <div className="fixed inset-0 z-50 bg-black/40">
      <div className="h-svh w-full bg-background px-3 py-3">
        <div className="fit-screen flex h-full flex-col gap-3">
          <header className="flex items-center justify-between border-b border-black/10 px-1 py-2">
            <h2 className="text-lg font-normal">Paseo</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFaqOpen(true)}
                className="h-8 w-8 rounded-full bg-background text-text shadow-sm shadow-black/10"
                aria-label="Abrir ayuda"
              >
                ?
              </button>
              <button
                type="button"
                onClick={onClose}
                className="h-8 w-8 rounded-full bg-background text-text shadow-sm shadow-black/10"
                aria-label="Cerrar paseo"
              >
                X
              </button>
            </div>
          </header>

          <section className="rounded-[28px] bg-[linear-gradient(135deg,rgba(255,255,255,0.45),rgba(255,168,183,0.35))] p-3 shadow-lg shadow-black/15">
            <div className="relative aspect-4/3 overflow-hidden rounded-[22px] border-2 border-white/50">
              <Image
                src="/scenes/Hospital.png"
                alt=""
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 420px"
              />
              <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/15" />
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
                ⚡ {state.player.energy}/{state.player.maxEnergy}
              </div>
              <div className="rounded-full bg-background/80 px-3 py-1 shadow-sm shadow-black/10">
                😊 {state.player.mood}
              </div>
              <div className="rounded-full bg-background/80 px-3 py-1 shadow-sm shadow-black/10">
                😣 {state.player.stress}
              </div>
              <div className="rounded-full bg-background/80 px-3 py-1 shadow-sm shadow-black/10">
                🎵 {state.player.rhythm}
              </div>
              <div className="rounded-full bg-background/80 px-3 py-1 shadow-sm shadow-black/10">
                🧘 {state.player.calm}
              </div>
              <div className="rounded-full bg-background/80 px-3 py-1 shadow-sm shadow-black/10">
                🤔 {state.player.confusion}
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
                ? "Tu atacas primero"
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
              className="flex-1 rounded-full bg-primary px-3 py-2 text-xs text-text"
            >
              Terminar turno
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
      {isFaqOpen ? (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setIsFaqOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-background/95 p-4 text-xs text-text shadow-lg shadow-black/30"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">FAQ del modo Paseo</h3>
              <button
                type="button"
                onClick={() => setIsFaqOpen(false)}
                className="h-8 w-8 rounded-full bg-background text-text shadow-sm shadow-black/10"
                aria-label="Cerrar ayuda"
              >
                X
              </button>
            </div>
            <div className="mt-3 space-y-3">
              <div>
                <div className="text-[11px] font-semibold">Reglas basicas</div>
                <div className="mt-1 text-[11px] text-muted">
                  Juegas por turnos. Juega cartas hasta quedarte sin ⚡ o cuando
                  quieras terminar el turno. Luego actua el enemigo.
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold">Ganar o perder</div>
                <div className="mt-1 text-[11px] text-muted">
                  Ganas cuando la vida del enemigo llega a 0. Pierdes si tu
                  animo llega a 0 o si el combate termina por un efecto.
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold">Mecanicas</div>
                <div className="mt-1 text-[11px] text-muted">
                  Mantener pulsada una carta abre su detalle completo. Algunas
                  cartas aplican efectos especiales que se muestran con emojis.
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold">Traducciones</div>
                <div className="mt-1 text-[11px] text-muted">
                  ⚡ energia · 😊 animo · 😣 estres · 🎵 ritmo · 🧘 calma · 🤔
                  confusion
                </div>
                <div className="mt-1 text-[11px] text-muted">
                  💰 costo · 💥 dano · 🃏 robar · 🛡️ defensa · ⏭️👾 salta enemigo ·
                  🔁👾 repite enemigo · 🚪🏳️ termina combate · 🏷️➕ aplica etiqueta ·
                  📝 nota
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function WalkGameModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const deck = useShopStore((state) => state.deck);
  const enemy = ENEMY_DECKS[0];
  const starterDeck = useMemo(() => {
    const catalogById = new Map(
      CARD_CATALOG.map((card) => [card.id, card]),
    );
    const selectedDeck = deck
      .map((cardId) => catalogById.get(cardId))
      .filter((card): card is CardDefinition => Boolean(card))
      .slice(0, 12);
    return selectedDeck.length > 0 ? selectedDeck : CARD_CATALOG.slice(0, 12);
  }, [deck]);
  const deckKey = useMemo(
    () => starterDeck.map((card) => card.id).join("|"),
    [starterDeck],
  );

  if (!isOpen) {
    return null;
  }

  return (
    <WalkGameSession
      key={deckKey}
      starterDeck={starterDeck}
      enemy={enemy}
      onClose={onClose}
    />
  );
}
