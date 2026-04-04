import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IUser } from '@4event/types';

export function getDeviceId(): string {
  if (typeof window === 'undefined') return 'server';
  const stored = localStorage.getItem('device_id');
  if (stored) return stored;
  const id = crypto.randomUUID();
  localStorage.setItem('device_id', id);
  return id;
}

interface AuthState {
  token: string | null;
  user: IUser | null;
  isAuthenticated: boolean;

  login: (token: string, user: IUser) => void;
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

      login: (token, user) =>
        set({ token, user, isAuthenticated: true }),

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
