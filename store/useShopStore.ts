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
  deck: string[];
  decorations: string[];
  openShop: () => void;
  closeShop: () => void;
  openInventory: () => void;
  closeInventory: () => void;
  selectCategory: (categoryId: string) => void;
  purchaseItem: (itemId: string) => void;
  toggleDeckCard: (cardId: string) => void;
  toggleDecoration: (itemId: string) => void;
  rehydrate: () => Promise<void>;
};

const defaultCategory = SHOP_CATEGORIES[0]?.id ?? "banderas";

export const useShopStore = create<ShopStore>((set) => ({
  isOpen: false,
  isInventoryOpen: false,
  selectedCategory: defaultCategory,
  owned: [],
  deck: [],
  decorations: [],
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
  toggleDeckCard: (cardId) =>
    set((state) =>
      state.deck.includes(cardId)
        ? { ...state, deck: state.deck.filter((id) => id !== cardId) }
        : { ...state, deck: [...state.deck, cardId] },
    ),
  toggleDecoration: (itemId) =>
    set((state) => {
      if (state.decorations.includes(itemId)) {
        return {
          ...state,
          decorations: state.decorations.filter((id) => id !== itemId),
        };
      }
      const category = itemId.split("/")[0] ?? "";
      if (category === "banderas") {
        const withoutFlags = state.decorations.filter(
          (id) => !id.startsWith("banderas/"),
        );
        return {
          ...state,
          decorations: [...withoutFlags, itemId],
        };
      }
      return { ...state, decorations: [...state.decorations, itemId] };
    }),
  rehydrate: async () => {
    const stored = await readShopStorage();
    if (!stored) {
      return;
    }
    set({
      owned: stored.owned ?? [],
      selectedCategory: stored.selectedCategory ?? defaultCategory,
      deck: stored.deck ?? [],
      decorations: stored.decorations ?? [],
    });
  },
}));

if (typeof window !== "undefined") {
  useShopStore.subscribe((state) => {
    void writeShopStorage({
      version: SHOP_STORAGE_VERSION,
      owned: state.owned,
      selectedCategory: state.selectedCategory,
      deck: state.deck,
      decorations: state.decorations,
    });
  });
}
