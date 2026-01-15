"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { CARD_CATALOG } from "@/lib/encounters/cards";
import { ENEMY_DECKS } from "@/lib/encounters/enemies";
import type { CardDefinition } from "@/lib/encounters/types";
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
  const elementFrames: Record<string, string> = {
    impulso: "/cards/Impulso.png",
    calma: "/cards/Calma.png",
    caos: "/cards/Caos.png",
    vinculo: "/cards/Vinculo.png",
    territorio: "/cards/Territorio.png",
  };
  const getCardDamageLabel = (card: CardDefinition) => {
    let flat = 0;
    let pct = 0;
    for (const effect of card.effects) {
      if (effect.type === "enemy_hp_flat") {
        flat += effect.value ?? 0;
      }
      if (effect.type === "enemy_hp_pct") {
        pct += effect.value ?? 0;
      }
    }
    const parts = [];
    if (flat > 0) {
      parts.push(`${flat}`);
    }
    if (pct > 0) {
      parts.push(`${pct}%`);
    }
    return parts.length > 0 ? parts.join(" + ") : null;
  };
  const getCardEffectsLabel = (card: CardDefinition) => {
    const labels: string[] = [];
    for (const effect of card.effects) {
      switch (effect.type) {
        case "enemy_hp_flat":
        case "enemy_hp_pct":
          break;
        case "stress_add":
          labels.push(`+Estres ${effect.value}`);
          break;
        case "stress_reduce":
          labels.push(`-Estres ${effect.value}`);
          break;
        case "rhythm_add":
          labels.push(`+Ritmo ${effect.value}`);
          break;
        case "calm_add":
          labels.push(`+Calma ${effect.value}`);
          break;
        case "confusion_add":
          labels.push(`+Confusion ${effect.value}`);
          break;
        case "confusion_remove":
          labels.push(`-Confusion ${effect.value}`);
          break;
        case "draw_cards":
          labels.push(`Roba ${effect.value}`);
          break;
        case "heal_mood":
          labels.push(`Cura ${effect.value}`);
          break;
        case "damage_reduction_pct":
          labels.push(`Defensa ${effect.value}%`);
          break;
        case "skip_enemy_action":
          labels.push("Salta enemigo");
          break;
        case "repeat_enemy_last":
          labels.push("Repite enemigo");
          break;
        case "exit_combat":
          labels.push("Termina combate");
          break;
        case "apply_tag":
          labels.push(`${effect.tag}`);
          break;
        case "note":
          if (effect.text) {
            labels.push(effect.text);
          }
          break;
        default:
          break;
      }
    }
    return labels.length > 0 ? labels.join(" · ") : null;
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
                src="/scenes/housePlaceholder.png"
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
                width={120}
                height={90}
                className="absolute bottom-[6%] left-[60%] h-auto w-[clamp(90px,28vw,130px)] -translate-x-1/2 idle-float"
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
                className="group relative flex min-h-[150px] flex-col justify-between rounded-2xl border border-white/50 bg-background/30 p-3 text-left text-[11px] shadow-md shadow-black/15"
              >
                <Image
                  src={elementFrames[card.element] ?? "/cards/Impulso.png"}
                  alt=""
                  fill
                  className="object-contain opacity-95"
                  sizes="(max-width: 768px) 50vw, 200px"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/30" />
                <div className="relative z-10 text-[10px] text-white/90 drop-shadow">
                  {card.element.toUpperCase()} - {card.cost}
                </div>
                <div className="relative z-10 mt-1 text-sm text-white drop-shadow">
                  {card.name}
                </div>
                {getCardDamageLabel(card) ? (
                  <div className="relative z-10 text-[10px] text-white/85 drop-shadow">
                    Dano: {getCardDamageLabel(card)}
                  </div>
                ) : null}
                {getCardEffectsLabel(card) ? (
                  <div className="relative z-10 text-[10px] text-white/80 drop-shadow">
                    {getCardEffectsLabel(card)}
                  </div>
                ) : null}
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
