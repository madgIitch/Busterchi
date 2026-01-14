import { create } from "zustand";
import { SHOP_CATEGORIES } from "@/lib/shopCatalog";
import {
  readShopStorage,
  SHOP_STORAGE_VERSION,
  writeShopStorage,
} from "@/lib/shopStorage";

type ShopStore = {
  isOpen: boolean;
  isInventoryOpen: boolean;
  selectedCategory: string;
  owned: string[];
  openShop: () => void;
  closeShop: () => void;
  openInventory: () => void;
  closeInventory: () => void;
  selectCategory: (categoryId: string) => void;
  purchaseItem: (itemId: string) => void;
  rehydrate: () => Promise<void>;
};

const defaultCategory = SHOP_CATEGORIES[0]?.id ?? "banderas";

export const useShopStore = create<ShopStore>((set) => ({
  isOpen: false,
  isInventoryOpen: false,
  selectedCategory: defaultCategory,
  owned: [],
  openShop: () => set({ isOpen: true }),
  closeShop: () => set({ isOpen: false }),
  openInventory: () => set({ isInventoryOpen: true }),
  closeInventory: () => set({ isInventoryOpen: false }),
  selectCategory: (categoryId) => set({ selectedCategory: categoryId }),
  purchaseItem: (itemId) =>
    set((state) =>
      state.owned.includes(itemId)
        ? state
        : { ...state, owned: [...state.owned, itemId] },
    ),
  rehydrate: async () => {
    const stored = await readShopStorage();
    if (!stored) {
      return;
    }
    set({
      owned: stored.owned ?? [],
      selectedCategory: stored.selectedCategory ?? defaultCategory,
    });
  },
}));

if (typeof window !== "undefined") {
  useShopStore.subscribe((state) => {
    void writeShopStorage({
      version: SHOP_STORAGE_VERSION,
      owned: state.owned,
      selectedCategory: state.selectedCategory,
    });
  });
}
