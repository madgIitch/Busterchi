import { create } from "zustand";
import { applyDecay, DEFAULT_DECAY_RATES, PetStats } from "@/lib/decay";
import {
  ActionKey,
  getSpeechForAction,
  getSpeechForNeeds,
  getSpeechForSleep,
  SPEECH_LINES,
} from "@/lib/speech";
import {
  Cooldowns,
  PersistedPetState,
  STORAGE_VERSION,
  readStorage,
  writeStorage,
} from "@/lib/storage";

type PetStore = PetStats & {
  cooldowns: Cooldowns;
  lastSpeechLine: string;
  lastUpdated: number;
  lastCheckInDate: string | null;
  isSleeping: boolean;
  sleepUntil: number;
  setStat: (key: keyof PetStats, value: number) => void;
  performAction: (action: ActionKey) => void;
  rehydrate: () => void;
  updateSpeech: () => void;
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
  sleep: 0,
};

const COOLDOWN_MS: Record<ActionKey, number> = {
  snack: 2 * 60 * 1000,
  walk: 5 * 60 * 1000,
  pet: 1 * 60 * 1000,
  sleep: 10 * 60 * 1000,
};
const SLEEP_DURATION_MS = 10 * 60 * 1000;

const clampStat = (value: number) => Math.max(0, Math.min(100, value));

const getTodayKey = () => new Date().toISOString().slice(0, 10);
const isDev = process.env.NODE_ENV === "development";

export const usePetStore = create<PetStore>((set) => ({
  ...defaultStats,
  cooldowns: defaultCooldowns,
  lastSpeechLine: SPEECH_LINES.default[0],
  lastUpdated: 0,
  lastCheckInDate: null,
  isSleeping: false,
  sleepUntil: 0,
  setStat: (key, value) =>
    set((state) => ({
      ...state,
      [key]: clampStat(value),
    })),
  performAction: (action) => {
    set((state) => {
      const now = Date.now();
      const sleepCooldownActive =
        state.cooldowns.sleep &&
        now - state.cooldowns.sleep < SLEEP_DURATION_MS;
      const sleepingNow = state.sleepUntil > now || sleepCooldownActive;
      if (sleepingNow && action !== "sleep") {
        return state;
      }
      const lastUsed = state.cooldowns[action];
      const remaining = lastUsed
        ? COOLDOWN_MS[action] - (now - lastUsed)
        : 0;

      if (remaining > 0) {
        return state;
      }

      const nextStats: PetStats = { ...state };
      let nextSleepUntil = state.sleepUntil;
      let nextIsSleeping = sleepingNow;

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
      if (action === "sleep") {
        nextStats.energy = clampStat(state.energy + 35);
        nextSleepUntil = now + SLEEP_DURATION_MS;
        nextIsSleeping = true;
      }

      return {
        ...state,
        ...nextStats,
        cooldowns: {
          ...state.cooldowns,
          [action]: now,
        },
        lastSpeechLine: getSpeechForAction(action),
        lastUpdated: now,
        lastCheckInDate: getTodayKey(),
        isSleeping: nextIsSleeping,
        sleepUntil: nextSleepUntil,
      };
    });
  },
  rehydrate: () => {
    set((state) => {
      const now = Date.now();
      const stored = readStorage();
      const lastUpdatedBase =
        stored?.lastUpdated ?? (state.lastUpdated || now);
      const baseSleepUntil = stored?.sleepUntil ?? state.sleepUntil;
      const isSleeping = baseSleepUntil > now;
      const sleepUntil = isSleeping ? baseSleepUntil : 0;

      const baseStats = stored?.stats ?? {
        food: state.food,
        walk: state.walk,
        love: state.love,
        energy: state.energy,
      };

      const decayed = applyDecay(
        baseStats,
        (now - lastUpdatedBase) / 60000,
        DEFAULT_DECAY_RATES,
      );

      if (isDev) {
        console.log("[decay]", {
          minutes: (now - lastUpdatedBase) / 60000,
          before: baseStats,
          after: decayed,
        });
      }

      return {
        ...state,
        ...decayed,
        cooldowns: { ...defaultCooldowns, ...(stored?.cooldowns ?? {}) },
        lastSpeechLine: isSleeping
          ? getSpeechForSleep()
          : getSpeechForNeeds(decayed),
        lastUpdated: now,
        lastCheckInDate: stored?.lastCheckInDate ?? null,
        isSleeping,
        sleepUntil,
      };
    });
  },
  updateSpeech: () => {
    set((state) => ({
      ...state,
      lastSpeechLine: state.isSleeping
        ? getSpeechForSleep()
        : getSpeechForNeeds({
            food: state.food,
            walk: state.walk,
            love: state.love,
            energy: state.energy,
          }),
    }));
  },
}));

if (typeof window !== "undefined") {
  usePetStore.subscribe((state) => {
    const payload: PersistedPetState = {
      version: STORAGE_VERSION,
      stats: {
        food: state.food,
        walk: state.walk,
        love: state.love,
        energy: state.energy,
      },
      cooldowns: state.cooldowns,
      lastSpeechLine: state.lastSpeechLine,
      lastUpdated: state.lastUpdated,
      lastCheckInDate: state.lastCheckInDate,
      sleepUntil: state.sleepUntil,
    };
    writeStorage(payload);
  });
}
