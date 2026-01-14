export type ElementId =
  | "impulso"
  | "calma"
  | "caos"
  | "vinculo"
  | "territorio";

export type Rarity = "common" | "rare" | "epic";

export type CardEffect =
  | { type: "stress_add"; value: number }
  | { type: "stress_reduce"; value: number }
  | { type: "rhythm_add"; value: number }
  | { type: "calm_add"; value: number }
  | { type: "confusion_add"; value: number }
  | { type: "confusion_remove"; value: number }
  | { type: "skip_enemy_action" }
  | { type: "repeat_enemy_last" }
  | { type: "draw_cards"; value: number }
  | { type: "heal_mood"; value: number }
  | { type: "damage_reduction_pct"; value: number }
  | { type: "exit_combat" }
  | { type: "enemy_hp_pct"; value: number }
  | { type: "enemy_hp_flat"; value: number }
  | { type: "apply_tag"; tag: string }
  | { type: "note"; text: string };

export type CardDefinition = {
  id: string;
  name: string;
  element: ElementId;
  cost: 0 | 1 | 2 | 3;
  rarity: Rarity;
  tags?: string[];
  effects: CardEffect[];
  exhaust?: boolean;
  consumable?: boolean;
};

export type EnemyCardDefinition = {
  id: string;
  name: string;
  element: ElementId | ElementId[];
  effects: CardEffect[];
  cooldown?: number;
  tag?: "identity" | "basic" | "reactive" | "strong";
};

export type EnemyDeck = {
  id: string;
  name: string;
  elements: ElementId[];
  pattern: "rotation" | "weighted" | "reactive";
  cards: EnemyCardDefinition[];
};
