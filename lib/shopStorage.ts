import { idbGet, idbSet } from "@/lib/idb";

export type ShopPersistedState = {
  version: number;
  owned: string[];
  selectedCategory: string | null;
  deck: string[];
  decorations: string[];
};

type ShopPersistedStateV1 = {
  version: 1;
  owned: string[];
  selectedCategory: string | null;
};

type ShopPersistedStateV2 = {
  version: 2;
  owned: string[];
  selectedCategory: string | null;
  deck: string[];
};

export const SHOP_STORAGE_VERSION = 3;
export const SHOP_STORAGE_KEY = "bustergochi.shop.v1";

export async function readShopStorage(): Promise<ShopPersistedState | null> {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = await idbGet<
      ShopPersistedState | ShopPersistedStateV2 | ShopPersistedStateV1
    >(SHOP_STORAGE_KEY);
    if (stored && stored.version === SHOP_STORAGE_VERSION) {
      return stored;
    }
    if (stored && stored.version === 1) {
      return {
        ...stored,
        version: SHOP_STORAGE_VERSION,
        deck: [],
        decorations: [],
      };
    }
    if (stored && stored.version === 2) {
      return {
        ...stored,
        version: SHOP_STORAGE_VERSION,
        decorations: [],
      };
    }
    const raw = window.localStorage.getItem(SHOP_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as
      | ShopPersistedState
      | ShopPersistedStateV2
      | ShopPersistedStateV1;
    if (!parsed) {
      return null;
    }
    if (parsed.version === SHOP_STORAGE_VERSION) {
      void idbSet(SHOP_STORAGE_KEY, parsed);
      return parsed;
    }
    if (parsed.version === 1) {
      const migrated = {
        ...parsed,
        version: SHOP_STORAGE_VERSION,
        deck: [],
        decorations: [],
      };
      void idbSet(SHOP_STORAGE_KEY, migrated);
      return migrated;
    }
    if (parsed.version === 2) {
      const migrated = {
        ...parsed,
        version: SHOP_STORAGE_VERSION,
        decorations: [],
      };
      void idbSet(SHOP_STORAGE_KEY, migrated);
      return migrated;
    }
    return null;
  } catch {
    return null;
  }
}

export async function writeShopStorage(state: ShopPersistedState) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    await idbSet(SHOP_STORAGE_KEY, state);
    window.localStorage.setItem(SHOP_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors.
  }
}
