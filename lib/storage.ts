import type { PetStats } from "@/lib/decay";
import { idbGet, idbRemove, idbSet } from "@/lib/idb";

export type Cooldowns = {
  snack: number;
  walk: number;
  pet: number;
  sleep: number;
  bath: number;
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
  level: number;
  xp: number;
};

export const STORAGE_VERSION = 2;
export const STORAGE_KEY_V2 = "busterchi.pet.v2";
export const STORAGE_KEY_V1 = "busterchi.pet.v1";
export const STORAGE_KEY = STORAGE_KEY_V2;

type PersistedPetStateV1 = Omit<
  PersistedPetState,
  "version" | "stats" | "cooldowns" | "level" | "xp"
> & {
  version: 1;
  stats: Omit<PetStats, "hygiene">;
  cooldowns: Omit<Cooldowns, "bath">;
};

function parseStorageValue<T>(raw: string | null): T | null {
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function migrateV1(stored: PersistedPetStateV1): PersistedPetState {
  return {
    ...stored,
    version: STORAGE_VERSION,
    stats: {
      ...stored.stats,
      hygiene: 100,
    },
    cooldowns: {
      ...stored.cooldowns,
      bath: 0,
    },
    level: 1,
    xp: 0,
  };
}

export async function readStorage(): Promise<PersistedPetState | null> {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = await idbGet<PersistedPetState>(STORAGE_KEY_V2);
    if (stored && stored.version === STORAGE_VERSION) {
      return stored;
    }

    const localV2 = parseStorageValue<PersistedPetState>(
      window.localStorage.getItem(STORAGE_KEY_V2),
    );
    if (localV2 && localV2.version === STORAGE_VERSION) {
      void idbSet(STORAGE_KEY_V2, localV2);
      return localV2;
    }

    const idbV1 = await idbGet<PersistedPetStateV1>(STORAGE_KEY_V1);
    const localV1 = parseStorageValue<PersistedPetStateV1>(
      window.localStorage.getItem(STORAGE_KEY_V1),
    );
    const legacy = idbV1?.version === 1 ? idbV1 : localV1;
    if (legacy && legacy.version === 1) {
      const migrated = migrateV1(legacy);
      await writeStorage(migrated);
      window.localStorage.removeItem(STORAGE_KEY_V1);
      void idbRemove(STORAGE_KEY_V1);
      return migrated;
    }

    return null;
  } catch {
    return null;
  }
}

export async function writeStorage(state: PersistedPetState) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    await idbSet(STORAGE_KEY_V2, state);
    window.localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(state));
  } catch {
    // Ignore storage errors (private mode, quota, etc.).
  }
}
