import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type UserProfileExtras = {
  phone: string | null;
  fullName: string | null;
  avatarUri: string | null;
};

/** Стабильная ссылка для пустых данных — нужна для селекторов zustand + useSyncExternalStore. */
export const EMPTY_USER_EXTRAS: UserProfileExtras = Object.freeze({
  phone: null,
  fullName: null,
  avatarUri: null,
});

/**
 * Локальные поля профиля по user id (телефон на бэке в модели пользователя пока не хранится).
 */
export type ProfileExtrasState = {
  _hasHydrated: boolean;
  /** extras keyed by auth user id */
  perUser: Record<string, UserProfileExtras>;
  setHydrated: (value: boolean) => void;
  setPhoneForUser: (userId: string, phone: string | null) => void;
  setFullNameForUser: (userId: string, fullName: string | null) => void;
  setAvatarForUser: (userId: string, uri: string | null) => void;
  /** Очистить данные текущего пользователя (выход) */
  clearUser: (userId: string) => void;
  reset: () => void;
};

function patchUser(
  perUser: Record<string, UserProfileExtras>,
  userId: string,
  patch: Partial<UserProfileExtras>,
): Record<string, UserProfileExtras> {
  const prev = perUser[userId] ?? { ...EMPTY_USER_EXTRAS };
  return {
    ...perUser,
    [userId]: { ...prev, ...patch },
  };
}

export const useProfileExtrasStore = create<ProfileExtrasState>()(
  persist(
    (set) => ({
      _hasHydrated: false,
      perUser: {},
      setHydrated: (value) => set({ _hasHydrated: value }),
      setPhoneForUser: (userId, phone) =>
        set((s) => ({ perUser: patchUser(s.perUser, userId, { phone }) })),
      setFullNameForUser: (userId, fullName) =>
        set((s) => ({ perUser: patchUser(s.perUser, userId, { fullName }) })),
      setAvatarForUser: (userId, uri) =>
        set((s) => ({ perUser: patchUser(s.perUser, userId, { avatarUri: uri }) })),
      clearUser: (userId) =>
        set((s) => {
          const { [userId]: _, ...rest } = s.perUser;
          return { perUser: rest };
        }),
      reset: () => set({ perUser: {} }),
    }),
    {
      name: 'profile-extras-v2',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        perUser: state.perUser,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export function selectExtrasForUser(userId: string | undefined) {
  return (state: ProfileExtrasState): UserProfileExtras => {
    if (!userId) return EMPTY_USER_EXTRAS;
    return state.perUser[userId] ?? EMPTY_USER_EXTRAS;
  };
}
