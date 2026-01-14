export type ShopPersistedState = {
  version: number;
  owned: string[];
  selectedCategory: string | null;
};

export const SHOP_STORAGE_VERSION = 1;
export const SHOP_STORAGE_KEY = "bustergochi.shop.v1";

export function readShopStorage(): ShopPersistedState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(SHOP_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as ShopPersistedState;
    if (!parsed || parsed.version !== SHOP_STORAGE_VERSION) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeShopStorage(state: ShopPersistedState) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(SHOP_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors.
  }
}
