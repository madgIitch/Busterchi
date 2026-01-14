import type {
  CardDefinition,
  CardEffect,
  ElementId,
  EnemyDeck,
} from "@/lib/encounters/types";
import { ELEMENTS } from "@/lib/encounters/elements";

export type PlayerState = {
  mood: number;
  stress: number;
  rhythm: number;
  calm: number;
  confusion: number;
  energy: number;
  maxEnergy: number;
  damageReductionPct: number;
  skipEnemyAction: boolean;
  repeatEnemyLast: boolean;
};

export type EnemyState = {
  id: string;
  hp: number;
  lastCardId: string | null;
  rotationIndex: number;
  cooldowns: Record<string, number>;
};

export type CombatState = {
  turn: number;
  phase: "A" | "B";
  player: PlayerState;
  enemy: EnemyState;
  deck: CardDefinition[];
  hand: CardDefinition[];
  discard: CardDefinition[];
  exhaust: CardDefinition[];
  enemyDeck: EnemyDeck;
  lastPlayerCardElement: ElementId | null;
  playerCardsPlayed: number;
  log: string[];
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export function computeElementDistribution(deck: CardDefinition[]) {
  const counts: Record<ElementId, number> = {
    impulso: 0,
    calma: 0,
    caos: 0,
    vinculo: 0,
    territorio: 0,
  };
  if (deck.length === 0) {
    return counts;
  }
  for (const card of deck) {
    counts[card.element] += 1;
  }
  return counts;
}

export function computeAffinity(
  distribution: Record<ElementId, number>,
  against: ElementId,
) {
  const total =
    distribution.impulso +
    distribution.calma +
    distribution.caos +
    distribution.vinculo +
    distribution.territorio;
  if (total === 0) {
    return 0;
  }
  const strong = ELEMENTS[ELEMENTS[against].strongAgainst];
  const weak = ELEMENTS[ELEMENTS[against].weakAgainst];
  const strongPct = distribution[strong.label.toLowerCase() as ElementId] / total;
  const weakPct = distribution[weak.label.toLowerCase() as ElementId] / total;
  return strongPct - weakPct;
}

export function computeDamage(
  baseDamage: number,
  affinity: number,
  factor = 1.5,
) {
  const finalDamage = baseDamage * (1 - affinity * factor);
  return Math.max(0, Math.round(finalDamage));
}

export function createCombatState(
  playerDeck: CardDefinition[],
  enemyDeck: EnemyDeck,
) {
  const initialDeck = [...playerDeck];
  const state: CombatState = {
    turn: 1,
    phase: "A",
    player: {
      mood: 100,
      stress: 0,
      rhythm: 0,
      calm: 0,
      confusion: 0,
      energy: 3,
      maxEnergy: 3,
      damageReductionPct: 0,
      skipEnemyAction: false,
      repeatEnemyLast: false,
    },
    enemy: {
      id: enemyDeck.id,
      hp: 100,
      lastCardId: null,
      rotationIndex: 0,
      cooldowns: {},
    },
    deck: initialDeck,
    hand: [],
    discard: [],
    exhaust: [],
    enemyDeck,
    lastPlayerCardElement: null,
    playerCardsPlayed: 0,
    log: [],
  };
  drawCards(state, 5);
  return state;
}

export function drawCards(state: CombatState, count: number) {
  for (let i = 0; i < count; i += 1) {
    if (state.deck.length === 0 && state.discard.length > 0) {
      state.deck = shuffle(state.discard);
      state.discard = [];
    }
    const card = state.deck.shift();
    if (card) {
      state.hand.push(card);
    }
  }
}

export function playCard(state: CombatState, cardId: string) {
  const index = state.hand.findIndex((card) => card.id === cardId);
  if (index === -1) {
    return;
  }
  if (state.playerCardsPlayed >= 2) {
    return;
  }
  const card = state.hand[index];
  if (card.cost > state.player.energy) {
    return;
  }
  state.hand.splice(index, 1);
  state.player.energy -= card.cost;
  applyEffects(state, card.effects);
  state.lastPlayerCardElement = card.element;
  state.playerCardsPlayed += 1;
  if (card.exhaust || card.consumable) {
    state.exhaust.push(card);
  } else {
    state.discard.push(card);
  }
  state.log.push(`Player: ${card.name}`);
}

export function endTurn(state: CombatState) {
  if (state.phase === "A") {
    runEnemyStep(state, 2);
    state.phase = "B";
    runEnemyStep(state, 2);
    startPlayerStep(state);
    return;
  }

  state.phase = "A";
  startPlayerStep(state);
}

function startPlayerStep(state: CombatState) {
  state.player.energy = state.player.maxEnergy;
  state.player.damageReductionPct = 0;
  state.playerCardsPlayed = 0;
  state.turn += 1;
  drawCards(state, 1);
}

function applyEffects(state: CombatState, effects: CardEffect[]) {
  for (const effect of effects) {
    switch (effect.type) {
      case "stress_add":
        state.player.stress = clamp(state.player.stress + effect.value, 0, 100);
        break;
      case "stress_reduce":
        state.player.stress = clamp(state.player.stress - effect.value, 0, 100);
        break;
      case "rhythm_add":
        state.player.rhythm = clamp(state.player.rhythm + effect.value, 0, 10);
        break;
      case "calm_add":
        state.player.calm = clamp(state.player.calm + effect.value, 0, 10);
        break;
      case "confusion_add":
        state.player.confusion = clamp(
          state.player.confusion + effect.value,
          0,
          10,
        );
        break;
      case "confusion_remove":
        state.player.confusion = clamp(
          state.player.confusion - effect.value,
          0,
          10,
        );
        break;
      case "draw_cards":
        drawCards(state, effect.value);
        break;
      case "heal_mood":
        state.player.mood = clamp(state.player.mood + effect.value, 0, 100);
        break;
      case "damage_reduction_pct":
        state.player.damageReductionPct = Math.max(
          state.player.damageReductionPct,
          effect.value,
        );
        break;
      case "skip_enemy_action":
        state.player.skipEnemyAction = true;
        break;
      case "repeat_enemy_last":
        state.player.repeatEnemyLast = true;
        break;
      case "exit_combat":
        state.enemy.hp = 0;
        break;
      case "enemy_hp_pct":
        state.enemy.hp = clamp(
          Math.round(state.enemy.hp * (1 - effect.value / 100)),
          0,
          100,
        );
        break;
      case "apply_tag":
      case "note":
        break;
      default:
        break;
    }
  }
}

function selectEnemyCard(state: CombatState) {
  const deck = state.enemyDeck.cards;
  if (deck.length === 0) {
    return null;
  }

  const isOnCooldown = (cardId: string) =>
    state.enemy.cooldowns[cardId] !== undefined;
  const available = deck.filter((card) => !isOnCooldown(card.id));
  if (available.length === 0) {
    return deck[0];
  }

  if (state.player.repeatEnemyLast && state.enemy.lastCardId) {
    state.player.repeatEnemyLast = false;
    return (
      available.find((card) => card.id === state.enemy.lastCardId) ??
      available[0]
    );
  }

  if (state.enemyDeck.pattern === "rotation") {
    const startIndex = state.enemy.rotationIndex % deck.length;
    for (let i = 0; i < deck.length; i += 1) {
      const idx = (startIndex + i) % deck.length;
      const candidate = deck[idx];
      if (!isOnCooldown(candidate.id)) {
        state.enemy.rotationIndex = idx + 1;
        return candidate;
      }
    }
    return available[0];
  }

  if (state.enemyDeck.pattern === "weighted") {
    const basics = available.filter((card) => card.tag === "basic");
    const reactives = available.filter((card) => card.tag === "reactive");
    const strong = available.filter((card) => card.tag === "strong");
    const identity = available.filter((card) => card.tag === "identity");
    const roll = Math.random();
    if (roll < 0.6 && basics.length > 0) {
      return basics[Math.floor(Math.random() * basics.length)];
    }
    if (roll < 0.8 && reactives.length > 0) {
      return reactives[Math.floor(Math.random() * reactives.length)];
    }
    if (roll < 0.95 && strong.length > 0) {
      return strong[Math.floor(Math.random() * strong.length)];
    }
    if (identity.length > 0) {
      return identity[Math.floor(Math.random() * identity.length)];
    }
    return available[0];
  }

  if (state.enemyDeck.pattern === "reactive") {
    const reactives = available.filter((card) => card.tag === "reactive");
    const basics = available.filter((card) => card.tag === "basic");
    if (state.lastPlayerCardElement === "impulso" && reactives.length > 0) {
      return reactives[Math.floor(Math.random() * reactives.length)];
    }
    if (basics.length > 0) {
      return basics[Math.floor(Math.random() * basics.length)];
    }
    return available[0];
  }

  return available[Math.floor(Math.random() * available.length)];
}

function runEnemyStep(state: CombatState, actions: number) {
  for (let i = 0; i < actions; i += 1) {
    runEnemyAction(state);
    tickEnemyCooldowns(state);
  }
}

function runEnemyAction(state: CombatState) {
  if (state.player.skipEnemyAction) {
    state.log.push("Enemy: skipped");
    state.player.skipEnemyAction = false;
    return;
  }

  const enemyCard = selectEnemyCard(state);
  state.enemy.lastCardId = enemyCard?.id ?? null;
  if (!enemyCard) {
    return;
  }

  applyEffects(state, enemyCard.effects);
  state.log.push(`Enemy: ${enemyCard.name}`);
  if (enemyCard.cooldown && enemyCard.cooldown > 0) {
    state.enemy.cooldowns[enemyCard.id] = enemyCard.cooldown;
  }
}

function tickEnemyCooldowns(state: CombatState) {
  for (const [id, value] of Object.entries(state.enemy.cooldowns)) {
    if (value <= 1) {
      delete state.enemy.cooldowns[id];
    } else {
      state.enemy.cooldowns[id] = value - 1;
    }
  }
}

function shuffle<T>(items: T[]) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}
