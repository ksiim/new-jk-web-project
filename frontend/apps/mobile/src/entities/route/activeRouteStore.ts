import { create } from 'zustand';

import type { RouteGeneratedPublic } from './types';

type ActiveRouteState = {
  route: RouteGeneratedPublic | null;
  setRoute: (route: RouteGeneratedPublic | null) => void;
};

export const useActiveRouteStore = create<ActiveRouteState>((set) => ({
  route: null,
  setRoute: (route) => set({ route }),
}));
