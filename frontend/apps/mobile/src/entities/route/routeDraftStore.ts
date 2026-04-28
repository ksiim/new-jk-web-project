import { create } from 'zustand';

type RouteDraftState = {
  poeIds: string[];
  addPoint: (id: string) => void;
  removePoint: (id: string) => void;
  hasPoint: (id: string) => boolean;
};

export const useRouteDraftStore = create<RouteDraftState>((set, get) => ({
  poeIds: [],
  addPoint: (id) =>
    set((state) =>
      state.poeIds.includes(id)
        ? state
        : { ...state, poeIds: [...state.poeIds, id] },
    ),
  removePoint: (id) =>
    set((state) => ({ ...state, poeIds: state.poeIds.filter((x) => x !== id) })),
  hasPoint: (id) => get().poeIds.includes(id),
}));
