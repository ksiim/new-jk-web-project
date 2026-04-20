import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * Данные, которых нет на бэке, но нужны UI:
 *   - телефон (пока не хранится в user модели);
 *   - локально отредактированные ФИО (если юзер менял через форму редактирования);
 *   - URI аватара.
 * Всё персистится в AsyncStorage. Когда появится соответствующий API — просто
 * синхронизируем при логине/сохранении профиля.
 */
export type ProfileExtrasState = {
  phone: string | null;
  fullName: string | null;
  avatarUri: string | null;
  setPhone: (phone: string | null) => void;
  setFullName: (fullName: string | null) => void;
  setAvatarUri: (uri: string | null) => void;
  reset: () => void;
};

export const useProfileExtrasStore = create<ProfileExtrasState>()(
  persist(
    (set) => ({
      phone: null,
      fullName: null,
      avatarUri: null,
      setPhone: (phone) => set({ phone }),
      setFullName: (fullName) => set({ fullName }),
      setAvatarUri: (avatarUri) => set({ avatarUri }),
      reset: () => set({ phone: null, fullName: null, avatarUri: null }),
    }),
    {
      name: 'profile-extras',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
