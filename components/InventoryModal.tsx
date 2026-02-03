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
                  <div className="text-xs text-muted">
                    {deck.length}/{maxDeckSize}
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
              <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted">
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
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
