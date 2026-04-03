import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IUser } from '@4event/types';

interface AuthState {
  token: string | null;
  user: IUser | null;
  isAuthenticated: boolean;

  setAuth: (token: string, user: IUser) => void;
  setUser: (user: IUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setAuth: (token, user) =>
        set({ token, user, isAuthenticated: true }),

      setUser: (user) => set({ user }),

      logout: () =>
        set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    },
  ),
);
