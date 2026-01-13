import { create } from "zustand";

type PetStats = {
  food: number;
  walk: number;
  love: number;
  energy: number;
};

type PetStore = PetStats & {
  setStat: (key: keyof PetStats, value: number) => void;
};

const defaultStats: PetStats = {
  food: 70,
  walk: 70,
  love: 70,
  energy: 70,
};

export const usePetStore = create<PetStore>((set) => ({
  ...defaultStats,
  setStat: (key, value) =>
    set((state) => ({
      ...state,
      [key]: Math.max(0, Math.min(100, value)),
    })),
}));
