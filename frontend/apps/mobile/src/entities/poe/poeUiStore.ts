import { create } from 'zustand';

type PoeFiltersState = {
  category: string | null;
  wheelchairOnly: boolean;
  avoidStairs: boolean;
  radiusMeters: number | null;
  setCategory: (value: string | null) => void;
  setWheelchairOnly: (value: boolean) => void;
  setAvoidStairs: (value: boolean) => void;
  setRadiusMeters: (value: number | null) => void;
  resetFilters: () => void;
};

const initialFilters = {
  category: null as string | null,
  wheelchairOnly: false,
  avoidStairs: false,
  radiusMeters: null as number | null,
};

export const usePoeFiltersStore = create<PoeFiltersState>((set) => ({
  ...initialFilters,
  setCategory: (category) => set({ category }),
  setWheelchairOnly: (wheelchairOnly) => set({ wheelchairOnly }),
  setAvoidStairs: (avoidStairs) => set({ avoidStairs }),
  setRadiusMeters: (radiusMeters) => set({ radiusMeters }),
  resetFilters: () => set(initialFilters),
}));

type PoeFavoritesState = {
  favouriteIds: string[];
  toggleFavourite: (id: string) => void;
};

export const usePoeFavouritesStore = create<PoeFavoritesState>((set, get) => ({
  favouriteIds: [],
  toggleFavourite: (id) => {
    const current = get().favouriteIds;
    set({
      favouriteIds: current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id],
    });
  },
}));
