import { create } from "zustand";
import { SPEECH_LINES } from "@/lib/speech";

type PetStats = {
  food: number;
  walk: number;
  love: number;
  energy: number;
};

type Cooldowns = {
  snack: number;
  walk: number;
  pet: number;
};

type ActionKey = keyof Cooldowns;

type PetStore = PetStats & {
  cooldowns: Cooldowns;
  lastSpeechLine: string;
  setStat: (key: keyof PetStats, value: number) => void;
  performAction: (action: ActionKey) => void;
};

const defaultStats: PetStats = {
  food: 70,
  walk: 70,
  love: 70,
  energy: 70,
};

const defaultCooldowns: Cooldowns = {
  snack: 0,
  walk: 0,
  pet: 0,
};

const COOLDOWN_MS: Record<ActionKey, number> = {
  snack: 2 * 60 * 1000,
  walk: 5 * 60 * 1000,
  pet: 1 * 60 * 1000,
};

const clampStat = (value: number) => Math.max(0, Math.min(100, value));

const getRandomSpeech = () => {
  const index = Math.floor(Math.random() * SPEECH_LINES.length);
  return SPEECH_LINES[index];
};

export const usePetStore = create<PetStore>((set) => ({
  ...defaultStats,
  cooldowns: defaultCooldowns,
  lastSpeechLine: SPEECH_LINES[0],
  setStat: (key, value) =>
    set((state) => ({
      ...state,
      [key]: clampStat(value),
    })),
  performAction: (action) => {
    set((state) => {
      const now = Date.now();
      const lastUsed = state.cooldowns[action];
      const remaining = lastUsed
        ? COOLDOWN_MS[action] - (now - lastUsed)
        : 0;

      if (remaining > 0) {
        return state;
      }

      const nextStats: PetStats = { ...state };

      if (action === "snack") {
        nextStats.food = clampStat(state.food + 15);
        nextStats.energy = clampStat(state.energy + 5);
      }

      if (action === "walk") {
        nextStats.walk = clampStat(state.walk + 20);
        nextStats.energy = clampStat(state.energy - 10);
      }

      if (action === "pet") {
        nextStats.love = clampStat(state.love + 18);
        nextStats.energy = clampStat(state.energy - 2);
      }

      return {
        ...state,
        ...nextStats,
        cooldowns: {
          ...state.cooldowns,
          [action]: now,
        },
        lastSpeechLine: getRandomSpeech(),
      };
    });
  },
}));
