"use client";

import Image from "next/image";
import { useState } from "react";
import { CARD_CATALOG } from "@/lib/encounters/cards";
import { ENABLE_WALK_GAME } from "@/lib/encounters/config";
import type { CardDefinition } from "@/lib/encounters/types";
import { SHOP_CATEGORIES } from "@/lib/shopCatalog";
import { useShopStore } from "@/store/useShopStore";

function formatNameFromId(id: string) {
  const name = id.split("/").pop() ?? id;
  return name
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

const getCardEffectsDescription = (card: CardDefinition) => {
  const labels: string[] = [];
  for (const effect of card.effects) {
    switch (effect.type) {
      case "enemy_hp_flat":
      case "enemy_hp_pct":
        break;
      case "stress_add":
        labels.push(`+Estres ${effect.value ?? 0}`);
        break;
      case "stress_reduce":
        labels.push(`-Estres ${effect.value ?? 0}`);
        break;
      case "rhythm_add":
        labels.push(`+Ritmo ${effect.value ?? 0}`);
        break;
      case "calm_add":
        labels.push(`+Calma ${effect.value ?? 0}`);
        break;
      case "confusion_add":
        labels.push(`+Confusion ${effect.value ?? 0}`);
        break;
      case "confusion_remove":
        labels.push(`-Confusion ${effect.value ?? 0}`);
        break;
      case "draw_cards":
        labels.push(`Roba ${effect.value ?? 0}`);
        break;
      case "heal_mood":
        labels.push(`Cura ${effect.value ?? 0}`);
        break;
      case "damage_reduction_pct":
        labels.push(`Defensa ${effect.value ?? 0}%`);
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
        if (effect.tag) {
          labels.push(`Etiqueta ${effect.tag}`);
        }
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
  return labels;
};

type ElementId = CardDefinition["element"];

const ELEMENT_ORDER: ElementId[] = [
  "impulso",
  "calma",
  "caos",
  "vinculo",
  "territorio",
];

const ELEMENT_STYLE: Record<
  ElementId,
  {
    label: string;
    emoji: string;
    border: string;
    chip: string;
    selectedBg: string;
    count: string;
    segment: string;
    check: string;
  }
> = {
  impulso: {
    label: "Impulso",
    emoji: "🏃",
    border: "border-orange-400",
    chip: "bg-orange-500/90 text-white",
    selectedBg: "bg-orange-500/15",
    count: "bg-orange-500/15 text-orange-900 border-orange-400/60",
    segment: "bg-orange-500",
    check: "bg-orange-500 text-white",
  },
  calma: {
    label: "Calma",
    emoji: "🧘",
    border: "border-sky-400",
    chip: "bg-sky-500/90 text-white",
    selectedBg: "bg-sky-500/15",
    count: "bg-sky-500/15 text-sky-900 border-sky-400/60",
    segment: "bg-sky-500",
    check: "bg-sky-500 text-white",
  },
  caos: {
    label: "Caos",
    emoji: "🌪️",
    border: "border-violet-400",
    chip: "bg-violet-500/90 text-white",
    selectedBg: "bg-violet-500/15",
    count: "bg-violet-500/15 text-violet-900 border-violet-400/60",
    segment: "bg-violet-500",
    check: "bg-violet-500 text-white",
  },
  vinculo: {
    label: "Vinculo",
    emoji: "🤝",
    border: "border-emerald-400",
    chip: "bg-emerald-500/90 text-white",
    selectedBg: "bg-emerald-500/15",
    count: "bg-emerald-500/15 text-emerald-900 border-emerald-400/60",
    segment: "bg-emerald-500",
    check: "bg-emerald-500 text-white",
  },
  territorio: {
    label: "Territorio",
    emoji: "🧭",
    border: "border-amber-700",
    chip: "bg-amber-700/90 text-white",
    selectedBg: "bg-amber-700/15",
    count: "bg-amber-700/15 text-amber-950 border-amber-700/60",
    segment: "bg-amber-700",
    check: "bg-amber-700 text-white",
  },
};

export default function InventoryModal() {
  const {
    isInventoryOpen,
    closeInventory,
    owned,
    deck,
    decorations,
    toggleDeckCard,
    toggleDecoration,
  } = useShopStore();
  const [activeTab, setActiveTab] = useState<"inventory" | "deck">("inventory");
  const [inventoryCategory, setInventoryCategory] = useState(
    SHOP_CATEGORIES[0]?.id ?? "banderas",
  );
  const isDeckEnabled = ENABLE_WALK_GAME;
  const effectiveTab = isDeckEnabled ? activeTab : "inventory";
  const [isDeckLimitHit, setIsDeckLimitHit] = useState(false);
  const maxDeckSize = 12;
  const catalogById = new Map(CARD_CATALOG.map((card) => [card.id, card]));
  const lastDeckElement =
    deck.length > 0 ? catalogById.get(deck[deck.length - 1])?.element : null;
  const progressStyle = lastDeckElement
    ? ELEMENT_STYLE[lastDeckElement]
    : ELEMENT_STYLE.impulso;
  const groupedCards = ELEMENT_ORDER.map((element) => ({
    element,
    cards: CARD_CATALOG.filter((card) => card.element === element),
  }));
  const ownedInCategory = owned.filter(
    (id) => id.split("/")[0] === inventoryCategory,
  );
  const deckCounts = deck.reduce(
    (acc, cardId) => {
      const card = catalogById.get(cardId);
      if (!card) {
        return acc;
      }
      acc[card.element] += 1;
      return acc;
    },
    {
      impulso: 0,
      calma: 0,
      caos: 0,
      vinculo: 0,
      territorio: 0,
    },
  );

  const handleToggleDeck = (cardId: string) => {
    setIsDeckLimitHit(false);
    if (deck.includes(cardId)) {
      toggleDeckCard(cardId);
      return;
    }
    if (deck.length >= maxDeckSize) {
      setIsDeckLimitHit(true);
      return;
    }
    toggleDeckCard(cardId);
  };

  const elementEmoji: Record<CardDefinition["element"], string> = {
    impulso: "🏃",
    calma: "🧘",
    caos: "🌪️",
    vinculo: "🤝",
    territorio: "🧭",
  };

  if (!isInventoryOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40">
      <div className="h-full w-full bg-surface">
        <header className="flex items-center justify-between border-b border-black/10 px-4 py-3">
          <h2 className="text-lg font-normal">Inventario</h2>
          <button
            type="button"
            onClick={closeInventory}
            className="h-8 w-8 rounded-full bg-background text-text shadow-sm shadow-black/10"
            aria-label="Cerrar inventario"
          >
            X
          </button>
        </header>

        <section className="max-h-[calc(100svh-56px)] overflow-y-auto p-4">
          <div className="mb-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("inventory")}
              className={`rounded-full px-3 py-1 text-xs ${
                effectiveTab === "inventory"
                  ? "bg-[var(--color-primary)] text-text"
                  : "bg-background text-muted"
              }`}
            >
              Inventario
            </button>
            {isDeckEnabled ? (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab("deck")}
                  className={`rounded-full px-3 py-1 text-xs ${
                    effectiveTab === "deck"
                      ? "bg-[var(--color-primary)] text-text"
                      : "bg-background text-muted"
                  }`}
                >
                  Mazo
                </button>
                {effectiveTab === "deck" ? (
                  <div
                    className="grid flex-1 grid-cols-12 gap-0.5"
                    aria-label={`Mazo ${deck.length}/${maxDeckSize}`}
                  >
                    {Array.from({ length: maxDeckSize }, (_, index) => (
                      <span
                        key={index}
                        className={`h-2 rounded-full ${
                          index < deck.length
                            ? progressStyle.segment
                            : "bg-background/70"
                        }`}
                      />
                    ))}
                  </div>
                ) : null}
              </>
            ) : null}
          </div>

          {effectiveTab === "inventory" ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {SHOP_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setInventoryCategory(category.id)}
                    className={`rounded-full px-3 py-1 text-xs ${
                      inventoryCategory === category.id
                        ? "bg-[var(--color-primary)] text-text"
                        : "bg-background text-muted"
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
              {ownedInCategory.length === 0 ? (
                <div className="rounded-2xl bg-background p-4 text-sm text-muted">
                  No tienes items en esta categoria.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {ownedInCategory.map((id) => {
                    const isPlaced = decorations.includes(id);
                    return (
                      <div
                        key={id}
                        className="rounded-2xl bg-background p-3 shadow-sm shadow-black/10"
                      >
                        <div className="flex h-20 items-center justify-center overflow-hidden rounded-xl bg-white/60">
                          <Image
                            src={`/store/${id}`}
                            alt={formatNameFromId(id)}
                            width={80}
                            height={80}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <p className="mt-2 break-words text-xs leading-4">
                          {formatNameFromId(id)}
                        </p>
                        <button
                          type="button"
                          onClick={() => toggleDecoration(id)}
                          className="mt-2 w-full rounded-full bg-surface px-2 py-1 text-[10px] text-text shadow-sm shadow-black/10"
                        >
                          {isPlaced ? "Quitar de casa" : "Colocar en casa"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs text-muted">
                Selecciona hasta {maxDeckSize} cartas para tu mazo.
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[10px]">
                {ELEMENT_ORDER.map((element) => {
                  const style = ELEMENT_STYLE[element];
                  return (
                    <div
                      key={element}
                      className={`rounded-full border px-2 py-1 shadow-sm shadow-black/10 ${style.count}`}
                    >
                      {style.emoji} {style.label}: {deckCounts[element]}
                    </div>
                  );
                })}
              </div>
              <div className="hidden flex-wrap items-center gap-2 text-[10px] text-muted">
                <div className="rounded-full bg-background px-2 py-1 shadow-sm shadow-black/10">
                  🏃 Impulso: {deckCounts.impulso}
                </div>
                <div className="rounded-full bg-background px-2 py-1 shadow-sm shadow-black/10">
                  🧘 Calma: {deckCounts.calma}
                </div>
                <div className="rounded-full bg-background px-2 py-1 shadow-sm shadow-black/10">
                  🌪️ Caos: {deckCounts.caos}
                </div>
                <div className="rounded-full bg-background px-2 py-1 shadow-sm shadow-black/10">
                  🤝 Vinculo: {deckCounts.vinculo}
                </div>
                <div className="rounded-full bg-background px-2 py-1 shadow-sm shadow-black/10">
                  🧭 Territorio: {deckCounts.territorio}
                </div>
              </div>
              {isDeckLimitHit ? (
                <div className="rounded-xl bg-background px-3 py-2 text-xs text-muted shadow-sm shadow-black/10">
                  Maximo alcanzado: {maxDeckSize} cartas.
                </div>
              ) : null}
              <div className="space-y-5">
                {groupedCards.map(({ element, cards }) => {
                  const style = ELEMENT_STYLE[element];
                  return (
                    <section key={element} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div
                          className={`rounded-full border px-3 py-1 text-xs shadow-sm shadow-black/10 ${style.count}`}
                        >
                          {style.emoji} {style.label}
                        </div>
                        <div className="text-[10px] text-muted">
                          {deckCounts[element]} en mazo
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {cards.map((card) => {
                          const isSelected = deck.includes(card.id);
                          const descriptions = getCardEffectsDescription(card);
                          return (
                            <button
                              key={card.id}
                              type="button"
                              onClick={() => handleToggleDeck(card.id)}
                              className={`relative rounded-2xl border-2 p-3 pt-9 text-left shadow-sm shadow-black/10 transition active:scale-95 ${
                                isSelected
                                  ? `${style.border} ${style.selectedBg}`
                                  : `${style.border} bg-surface/80`
                              }`}
                              aria-pressed={isSelected}
                            >
                              <span
                                className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] shadow-sm shadow-black/10 ${style.chip}`}
                              >
                                {style.emoji} {style.label}
                              </span>
                              <span className="absolute right-2 top-2 rounded-full bg-background px-2 py-0.5 text-[10px] text-text shadow-sm shadow-black/10">
                                💰 {card.cost}
                              </span>
                              <div className="pr-1 text-sm font-semibold leading-4 text-text">
                                {card.name}
                              </div>
                              {descriptions.length > 0 ? (
                                <div className="mt-2 space-y-1 text-[10px] leading-3 text-muted">
                                  {descriptions.map((line, index) => (
                                    <div key={`${card.id}-${index}`}>{line}</div>
                                  ))}
                                </div>
                              ) : null}
                              {isSelected ? (
                                <div
                                  className={`absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full text-xs shadow-md shadow-black/20 ${style.check}`}
                                >
                                  ✔
                                </div>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
              <div className="hidden grid-cols-2 gap-3 sm:grid-cols-3">
                {CARD_CATALOG.map((card) => {
                  const isSelected = deck.includes(card.id);
                  const descriptions = getCardEffectsDescription(card);
                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => handleToggleDeck(card.id)}
                      className={`rounded-2xl border p-3 text-left text-xs shadow-sm shadow-black/10 ${
                        isSelected
                          ? "border-[var(--color-primary)] bg-background"
                          : "border-transparent bg-surface"
                      }`}
                      aria-pressed={isSelected}
                    >
                      <div className="flex items-center justify-between text-[10px] text-muted">
                        <span>
                          {elementEmoji[card.element]} {card.element}
                        </span>
                        <span>💰 {card.cost}</span>
                      </div>
                      <div className="mt-2 text-xs text-text">{card.name}</div>
                      {descriptions.length > 0 ? (
                        <div className="mt-2 space-y-1 text-[10px] text-muted">
                          {descriptions.map((line, index) => (
                            <div key={`${card.id}-${index}`}>{line}</div>
                          ))}
                        </div>
                      ) : null}
                      {isSelected ? (
                        <div className="mt-2 text-[10px] text-muted">✔</div>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
