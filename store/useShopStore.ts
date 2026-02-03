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
      if (category === "alfombras") {
        const withoutRugs = state.decorations.filter(
          (id) => !id.startsWith("alfombras/"),
        );
        return {
          ...state,
          decorations: [...withoutRugs, itemId],
        };
      }
      if (category === "carteles") {
        const withoutPosters = state.decorations.filter(
          (id) => !id.startsWith("carteles/"),
        );
        return {
          ...state,
          decorations: [...withoutPosters, itemId],
        };
      }
      if (category === "muebles") {
        const name = itemId.split("/").pop() ?? itemId;
        const lowerName = name.toLowerCase();
        let furnitureType = "otros";
        if (lowerName.startsWith("sillon")) {
          furnitureType = "sillon";
        } else if (lowerName.startsWith("mesa")) {
          furnitureType = "mesa";
        } else if (lowerName.startsWith("estanter")) {
          furnitureType = "estanteria";
        }
        const withoutSameType = state.decorations.filter((id) => {
          if (!id.startsWith("muebles/")) {
            return true;
          }
          const otherName = id.split("/").pop() ?? id;
          const otherLower = otherName.toLowerCase();
          if (furnitureType === "sillon") {
            return !otherLower.startsWith("sillon");
          }
          if (furnitureType === "mesa") {
            return !otherLower.startsWith("mesa");
          }
          if (furnitureType === "estanteria") {
            return !otherLower.startsWith("estanter");
          }
          return otherLower === lowerName;
        });
        return {
          ...state,
          decorations: [...withoutSameType, itemId],
        };
      }
      return { ...state, decorations: [...state.decorations, itemId] };
    }),
  rehydrate: async () => {
    const stored = await readShopStorage();
    if (!stored) {
      return;
    }
    const normalizeItemId = (id: string) => id.replace(/\.png\.png$/i, ".png");
    set({
      owned: (stored.owned ?? []).map(normalizeItemId),
      selectedCategory: stored.selectedCategory ?? defaultCategory,
      deck: stored.deck ?? [],
      decorations: (stored.decorations ?? []).map(normalizeItemId),
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
