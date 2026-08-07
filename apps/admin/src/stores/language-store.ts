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
      // Defer reading localStorage until after mount (see Providers).
      // Without this, the store rehydrates the persisted locale before the
      // first client paint while the server rendered the default ('ru'),
      // producing a hydration mismatch on every admin page that renders
      // locale-dependent text (e.g. the sidebar). That mismatch can leave
      // the tree in an inconsistent state where handlers don't attach in
      // Chromium-based browsers, so buttons appear unclickable.
      skipHydration: true,
    },
  ),
);
