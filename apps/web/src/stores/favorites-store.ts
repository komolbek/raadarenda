import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IProduct } from '@4event/types';
import { userApi } from '@/lib/api';

interface FavoritesState {
  favoriteIds: string[];
  favorites: IProduct[];
  isLoading: boolean;
  addFavorite: (productId: string) => void;
  removeFavorite: (productId: string) => void;
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  setFavorites: (ids: string[]) => void;
  fetchFavorites: () => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteIds: [],
      favorites: [],
      isLoading: false,

      addFavorite: (productId) =>
        set((state) => ({
          favoriteIds: state.favoriteIds.includes(productId)
            ? state.favoriteIds
            : [...state.favoriteIds, productId],
        })),

      removeFavorite: (productId) =>
        set((state) => ({
          favoriteIds: state.favoriteIds.filter((id) => id !== productId),
          favorites: state.favorites.filter((p) => p.id !== productId),
        })),

      toggleFavorite: (productId) => {
        const { favoriteIds } = get();
        if (favoriteIds.includes(productId)) {
          set({
            favoriteIds: favoriteIds.filter((id) => id !== productId),
            favorites: get().favorites.filter((p) => p.id !== productId),
          });
        } else {
          set({ favoriteIds: [...favoriteIds, productId] });
        }
      },

      isFavorite: (productId) => get().favoriteIds.includes(productId),

      setFavorites: (ids) => set({ favoriteIds: ids }),

      fetchFavorites: async () => {
        set({ isLoading: true });
        try {
          const products = await userApi.getFavorites();
          set({
            favorites: products,
            favoriteIds: products.map((p) => p.id),
            isLoading: false,
          });
        } catch {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'favorites-storage',
      partialize: (state) => ({ favoriteIds: state.favoriteIds }),
    },
  ),
);
