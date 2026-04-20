import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type LanguageId = 'ru' | 'en' | 'be' | 'kk' | 'zh';

export const LANGUAGE_LABELS: Record<LanguageId, string> = {
  ru: 'Русский',
  en: 'Английский',
  be: 'Белорусский',
  kk: 'Казахский',
  zh: 'Китайский',
};

export type NotificationKey = 'promos' | 'reminders' | 'route';

export type NotificationSettings = Record<NotificationKey, boolean>;

export type SettingsState = {
  language: LanguageId;
  notifications: NotificationSettings;
  setLanguage: (language: LanguageId) => void;
  toggleNotification: (key: NotificationKey) => void;
};

const defaultNotifications: NotificationSettings = {
  promos: false,
  reminders: true,
  route: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      language: 'ru',
      notifications: defaultNotifications,
      setLanguage: (language) => set({ language }),
      toggleNotification: (key) => {
        const current = get().notifications;
        set({ notifications: { ...current, [key]: !current[key] } });
      },
    }),
    {
      name: 'settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
