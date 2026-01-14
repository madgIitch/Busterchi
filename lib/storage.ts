import type { PetStats } from "@/lib/decay";

export type Cooldowns = {
  snack: number;
  walk: number;
  pet: number;
  sleep: number;
};

export type PersistedPetState = {
  version: number;
  stats: PetStats;
  cooldowns: Cooldowns;
  lastSpeechLine: string;
  lastUpdated: number;
  lastCheckInDate: string | null;
  sleepUntil: number;
  bucksters: number;
};

export const STORAGE_VERSION = 1;
export const STORAGE_KEY = "busterchi.pet.v1";

export function readStorage(): PersistedPetState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as PersistedPetState;
    if (!parsed || parsed.version !== STORAGE_VERSION) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeStorage(state: PersistedPetState) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors (private mode, quota, etc.).
  }
}
