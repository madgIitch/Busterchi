import Image from "next/image";
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

export default function WalkCard({
  card,
  onPlay,
  sizeClassName = "h-[150px]",
}: WalkCardProps) {
  return (
    <button
      type="button"
      onClick={onPlay}
      className={`group relative flex aspect-[3/4] ${sizeClassName} flex-col justify-between rounded-2xl border border-white/50 bg-background/30 p-3 text-left text-[11px] shadow-md shadow-black/15`}
    >
      <Image
        src={ELEMENT_FRAMES[card.element] ?? "/cards/Impulso.png"}
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
  );
}
