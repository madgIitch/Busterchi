import Image from "next/image";
import { useRef, useState } from "react";
import type { CardDefinition } from "@/lib/encounters/types";

const ELEMENT_FRAMES: Record<string, string> = {
  impulso: "/cards/Impulso.png",
  calma: "/cards/Calma.png",
  caos: "/cards/Caos.png",
  vinculo: "/cards/Vinculo.png",
  territorio: "/cards/Territorio.png",
};

type WalkCardProps = {
  card: CardDefinition;
  onPlay: () => void;
  sizeClassName?: string;
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
        labels.push(`+${effect.value ?? 0}😣`);
        break;
      case "stress_reduce":
        labels.push(`-${effect.value ?? 0}😣`);
        break;
      case "rhythm_add":
        labels.push(`+${effect.value ?? 0}🎵`);
        break;
      case "calm_add":
        labels.push(`+${effect.value ?? 0}🧘`);
        break;
      case "confusion_add":
        labels.push(`+${effect.value ?? 0}🤔`);
        break;
      case "confusion_remove":
        labels.push(`-${effect.value ?? 0}🤔`);
        break;
      case "draw_cards":
        labels.push(`+${effect.value ?? 0}🃏`);
        break;
      case "heal_mood":
        labels.push(`+${effect.value ?? 0}😊`);
        break;
      case "damage_reduction_pct":
        labels.push(`-${effect.value ?? 0}%🛡️`);
        break;
      case "skip_enemy_action":
        labels.push("⏭️👾");
        break;
      case "repeat_enemy_last":
        labels.push("🔁👾");
        break;
      case "exit_combat":
        labels.push("🚪🏳️");
        break;
      case "apply_tag":
        labels.push("🏷️➕");
        break;
      case "note":
        if (effect.text) {
          labels.push("📝");
        }
        break;
      default:
        break;
    }
  }
  return labels.length > 0 ? labels.join(" ") : null;
};

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

export default function WalkCard({
  card,
  onPlay,
  sizeClassName = "h-[150px]",
}: WalkCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggeredAtRef = useRef<number | null>(null);

  const startLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    longPressTriggeredAtRef.current = null;
    longPressTimerRef.current = setTimeout(() => {
      longPressTriggeredAtRef.current = Date.now();
      setShowDetails(true);
    }, 450);
  };

  const endLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleClick = () => {
    const now = Date.now();
    if (
      longPressTriggeredAtRef.current &&
      now - longPressTriggeredAtRef.current < 1000
    ) {
      longPressTriggeredAtRef.current = null;
      return;
    }
    onPlay();
  };

  const closeDetails = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setShowDetails(false);
    longPressTriggeredAtRef.current = null;
  };

  const effectLines = getCardEffectsDescription(card);

  return (
    <div className="relative">
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleClick();
          }
        }}
        onPointerDown={startLongPress}
        onPointerUp={endLongPress}
        onPointerLeave={endLongPress}
        onPointerCancel={endLongPress}
        className={`group relative aspect-3/4 ${sizeClassName} rounded-2xl border border-white/50 bg-background/30 text-left text-[11px] shadow-md shadow-black/15`}
      >
        <Image
          src={ELEMENT_FRAMES[card.element] ?? "/cards/Impulso.png"}
          alt=""
          fill
          className="object-contain opacity-95"
          sizes="(max-width: 768px) 50vw, 200px"
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/0 via-black/0 to-black/30" />
        <div className="absolute left-4 top-8 z-10 text-[10px] text-white drop-shadow">
          {card.name}
        </div>
        <div className="absolute left-4 top-12 z-10 text-[10px] text-white/90 drop-shadow">
          💰 {card.cost}
        </div>
        {getCardDamageLabel(card) ? (
          <div className="absolute left-4 bottom-7 z-10 text-[10px] text-white/85 drop-shadow">
            💥 {getCardDamageLabel(card)}
          </div>
        ) : null}
        {getCardEffectsLabel(card) ? (
          <div className="absolute left-4 bottom-3 z-10 text-[10px] text-white/80 drop-shadow">
            {getCardEffectsLabel(card)}
          </div>
        ) : null}
        {showDetails ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={(event) => {
              event.stopPropagation();
              closeDetails();
            }}
            onPointerDown={(event) => {
              event.stopPropagation();
            }}
            onPointerUp={(event) => {
              event.stopPropagation();
              closeDetails();
            }}
            onPointerCancel={(event) => {
              event.stopPropagation();
              closeDetails();
            }}
          >
            <div
              className="w-full max-w-xs rounded-2xl bg-background/95 p-4 text-xs text-text shadow-lg shadow-black/30"
              onClick={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
              onPointerUp={(event) => event.stopPropagation()}
              onPointerCancel={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm font-semibold">{card.name}</div>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    closeDetails();
                  }}
                  className="h-7 w-7 rounded-full bg-background text-text shadow-sm shadow-black/10"
                  aria-label="Cerrar detalle"
                >
                  X
                </button>
              </div>
              <div className="mt-1 text-[11px] text-muted">
                Tipo: {card.element.toUpperCase()} | Costo {card.cost}
              </div>
              {getCardDamageLabel(card) ? (
                <div className="mt-2 text-[11px]">
                  Dano: {getCardDamageLabel(card)}
                </div>
              ) : null}
              {effectLines.length > 0 ? (
                <div className="mt-2 text-[11px]">
                  <div className="font-semibold">Descripcion</div>
                  <div className="mt-1 space-y-1 text-[11px] text-muted">
                    {effectLines.map((line, index) => (
                      <div key={`${line}-${index}`}>{line}</div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

