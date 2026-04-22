import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AdminLocale = 'ru' | 'uz' | 'en';

interface LanguageState {
  locale: AdminLocale;
  setLocale: (locale: AdminLocale) => void;
}

export const useAdminLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      locale: 'ru',
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'admin-language-storage',
    },
  ),
);
