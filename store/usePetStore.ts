import { create } from "zustand";
import { applyDecay, DEFAULT_DECAY_RATES, PetStats } from "@/lib/decay";
import {
  ActionKey,
  getSpeechForAction,
  getSpeechForLevelUp,
  getSpeechForNeeds,
  getSpeechForSleep,
  getSpeechForTap,
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
  bucksters: number;
  level: number;
  xp: number;
  lastTapTime: number;
  isLevelingUp: boolean;
  setStat: (key: keyof PetStats, value: number) => void;
  performAction: (action: ActionKey) => void;
  tapPet: () => void;
  gainXP: (amount: number) => void;
  addBucksters: (amount: number) => void;
  clearLevelUp: () => void;
  rehydrate: () => Promise<void>;
  updateSpeech: () => void;
  spendBucksters: (amount: number) => boolean;
};

const defaultStats: PetStats = {
  food: 70,
  walk: 70,
  love: 70,
  energy: 70,
  hygiene: 70,
};

const defaultCooldowns: Cooldowns = {
  snack: 0,
  walk: 0,
  pet: 0,
  sleep: 0,
  bath: 0,
};

const COOLDOWN_MS: Record<ActionKey, number> = {
  snack: 2 * 60 * 1000,
  walk: 30 * 1000,
  pet: 1 * 60 * 1000,
  sleep: 10 * 60 * 1000,
  bath: 5 * 60 * 1000,
};
const SLEEP_DURATION_MS = 10 * 60 * 1000;
const BUCKSTER_REWARD: Record<ActionKey, number> = {
  snack: 1,
  walk: 2,
  pet: 1,
  sleep: 3,
  bath: 1,
};
const XP_THRESHOLDS = [0, 100, 250, 500, 900, 1400, 2000, 2700, 3500];
const XP_REWARD: Record<ActionKey, number> = {
  snack: 8,
  walk: 12,
  pet: 10,
  sleep: 20,
  bath: 10,
};

const clampStat = (value: number) => Math.max(0, Math.min(100, value));

const getTodayKey = () => new Date().toISOString().slice(0, 10);
const isDev = process.env.NODE_ENV === "development";
const DEV_BUCKSTERS = 999;

function computeLevelUp(
  currentXp: number,
  gainedXp: number,
  currentLevel: number,
) {
  const newXp = currentXp + gainedXp;
  let newLevel = currentLevel;
  while (
    newLevel < XP_THRESHOLDS.length &&
    newXp >= XP_THRESHOLDS[newLevel]
  ) {
    newLevel += 1;
  }
  return { newXp, newLevel, didLevelUp: newLevel > currentLevel };
}

export const usePetStore = create<PetStore>((set) => ({
  ...defaultStats,
  cooldowns: defaultCooldowns,
  lastSpeechLine: SPEECH_LINES.default[0],
  lastUpdated: 0,
  lastCheckInDate: null,
  isSleeping: false,
  sleepUntil: 0,
  bucksters: isDev ? DEV_BUCKSTERS : 0,
  level: 1,
  xp: 0,
  lastTapTime: 0,
  isLevelingUp: false,
  setStat: (key, value) =>
    set((state) => ({
      ...state,
      [key]: clampStat(value),
    })),
  performAction: (action) => {
    set((state) => {
      const now = Date.now();
      const sleepCooldownActive =
        state.cooldowns.sleep > 0 &&
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

      const nextStats: PetStats = {
        food: state.food,
        walk: state.walk,
        love: state.love,
        energy: state.energy,
        hygiene: state.hygiene,
      };
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
      if (action === "bath") {
        nextStats.hygiene = clampStat(state.hygiene + 25);
        nextStats.energy = clampStat(state.energy - 5);
      }

      const { newXp, newLevel, didLevelUp } = computeLevelUp(
        state.xp,
        XP_REWARD[action],
        state.level,
      );

      return {
        ...state,
        ...nextStats,
        cooldowns: {
          ...state.cooldowns,
          [action]: now,
        },
        lastUpdated: now,
        lastCheckInDate: getTodayKey(),
        isSleeping: nextIsSleeping,
        sleepUntil: nextSleepUntil,
        bucksters: state.bucksters + BUCKSTER_REWARD[action],
        xp: newXp,
        level: newLevel,
        isLevelingUp: didLevelUp,
        lastSpeechLine: didLevelUp
          ? getSpeechForLevelUp()
          : getSpeechForAction(action),
      };
    });
  },
  tapPet: () => {
    set((state) => {
      const now = Date.now();
      if (state.isSleeping || state.sleepUntil > now) {
        return state;
      }
      if (now - state.lastTapTime < 5000) {
        return state;
      }
      const { newXp, newLevel, didLevelUp } = computeLevelUp(
        state.xp,
        5,
        state.level,
      );
      return {
        ...state,
        love: clampStat(state.love + 2),
        lastTapTime: now,
        xp: newXp,
        level: newLevel,
        isLevelingUp: didLevelUp,
        lastSpeechLine: didLevelUp ? getSpeechForLevelUp() : getSpeechForTap(),
        lastUpdated: now,
        lastCheckInDate: getTodayKey(),
      };
    });
  },
  gainXP: (amount) => {
    set((state) => {
      const { newXp, newLevel, didLevelUp } = computeLevelUp(
        state.xp,
        amount,
        state.level,
      );
      return {
        ...state,
        xp: newXp,
        level: newLevel,
        isLevelingUp: didLevelUp,
        lastSpeechLine: didLevelUp
          ? getSpeechForLevelUp()
          : state.lastSpeechLine,
      };
    });
  },
  addBucksters: (amount) =>
    set((state) => ({ ...state, bucksters: state.bucksters + amount })),
  clearLevelUp: () => set((state) => ({ ...state, isLevelingUp: false })),
  rehydrate: async () => {
    const stored = await readStorage();
    set((state) => {
      const now = Date.now();
      const lastUpdatedBase =
        stored?.lastUpdated ?? (state.lastUpdated || now);
      const baseSleepUntil = stored?.sleepUntil ?? state.sleepUntil;
      const isSleeping = isDev ? false : baseSleepUntil > now;
      const sleepUntil = isDev ? 0 : isSleeping ? baseSleepUntil : 0;

      const baseStats: PetStats = {
        food: stored?.stats.food ?? state.food,
        walk: stored?.stats.walk ?? state.walk,
        love: stored?.stats.love ?? state.love,
        energy: stored?.stats.energy ?? state.energy,
        hygiene: stored?.stats.hygiene ?? 100,
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
        bucksters: isDev
          ? DEV_BUCKSTERS
          : stored?.bucksters ?? state.bucksters,
        level: stored?.level ?? state.level,
        xp: stored?.xp ?? state.xp,
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
            hygiene: state.hygiene,
          }),
    }));
  },
  spendBucksters: (amount) => {
    if (amount <= 0) {
      return true;
    }
    let success = false;
    set((state) => {
      if (state.bucksters < amount) {
        success = false;
        return state;
      }
      success = true;
      return { ...state, bucksters: state.bucksters - amount };
    });
    return success;
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
        hygiene: state.hygiene,
      },
      cooldowns: state.cooldowns,
      lastSpeechLine: state.lastSpeechLine,
      lastUpdated: state.lastUpdated,
      lastCheckInDate: state.lastCheckInDate,
      sleepUntil: state.sleepUntil,
      bucksters: state.bucksters,
      level: state.level,
      xp: state.xp,
    };
    void writeStorage(payload);
  });
}
