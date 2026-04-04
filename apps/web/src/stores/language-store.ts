import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Locale = 'ru' | 'uz' | 'en';

interface LanguageState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      locale: 'ru',
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'language-storage',
    },
  ),
);
