import { create } from 'zustand';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  phone?: string;
};

type AuthState = {
  _hasHydrated: boolean;
  hasSeenWelcome: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
  setHydrated: (value: boolean) => void;
  setHasSeenWelcome: (value: boolean) => void;
  login: (user: AuthUser) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()((set) => ({
  _hasHydrated: true,
  hasSeenWelcome: false,
  isAuthenticated: false,
  user: null,
  setHydrated: (value) => set({ _hasHydrated: value }),
  setHasSeenWelcome: (value) => set({ hasSeenWelcome: value }),
  login: (user) => set({ isAuthenticated: true, user }),
  logout: () => set({ isAuthenticated: false, user: null }),
}));
