import type { PetStats } from "@/lib/decay";
import { idbGet, idbSet } from "@/lib/idb";

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

export async function readStorage(): Promise<PersistedPetState | null> {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = await idbGet<PersistedPetState>(STORAGE_KEY);
    if (stored && stored.version === STORAGE_VERSION) {
      return stored;
    }
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as PersistedPetState;
    if (!parsed || parsed.version !== STORAGE_VERSION) {
      return null;
    }
    void idbSet(STORAGE_KEY, parsed);
    return parsed;
  } catch {
    return null;
  }
}

export async function writeStorage(state: PersistedPetState) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    await idbSet(STORAGE_KEY, state);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors (private mode, quota, etc.).
  }
}
