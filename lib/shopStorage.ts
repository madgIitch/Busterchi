import { idbGet, idbSet } from "@/lib/idb";

export type ShopPersistedState = {
  version: number;
  owned: string[];
  selectedCategory: string | null;
};

export const SHOP_STORAGE_VERSION = 1;
export const SHOP_STORAGE_KEY = "bustergochi.shop.v1";

export async function readShopStorage(): Promise<ShopPersistedState | null> {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = await idbGet<ShopPersistedState>(SHOP_STORAGE_KEY);
    if (stored && stored.version === SHOP_STORAGE_VERSION) {
      return stored;
    }
    const raw = window.localStorage.getItem(SHOP_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as ShopPersistedState;
    if (!parsed || parsed.version !== SHOP_STORAGE_VERSION) {
      return null;
    }
    void idbSet(SHOP_STORAGE_KEY, parsed);
    return parsed;
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
