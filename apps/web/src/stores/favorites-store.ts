import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesState {
  favoriteIds: string[];
  addFavorite: (productId: string) => void;
  removeFavorite: (productId: string) => void;
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  setFavorites: (ids: string[]) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteIds: [],

      addFavorite: (productId) =>
        set((state) => ({
          favoriteIds: state.favoriteIds.includes(productId)
            ? state.favoriteIds
            : [...state.favoriteIds, productId],
        })),

      removeFavorite: (productId) =>
        set((state) => ({
          favoriteIds: state.favoriteIds.filter((id) => id !== productId),
        })),

      toggleFavorite: (productId) => {
        const { favoriteIds } = get();
        if (favoriteIds.includes(productId)) {
          set({ favoriteIds: favoriteIds.filter((id) => id !== productId) });
        } else {
          set({ favoriteIds: [...favoriteIds, productId] });
        }
      },

      isFavorite: (productId) => get().favoriteIds.includes(productId),

      setFavorites: (ids) => set({ favoriteIds: ids }),
    }),
    {
      name: 'favorites-storage',
    },
  ),
);
