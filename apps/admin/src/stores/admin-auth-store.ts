import { create } from "zustand";

export type StaffRole = "OWNER" | "ADMIN" | "MANAGER" | "STAFF";

export interface StaffInfo {
  id: string;
  email: string;
  name: string;
  role: StaffRole;
  businessId: string;
  mustChangePassword?: boolean;
}

interface AdminAuthState {
  staff: StaffInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setStaff: (staff: StaffInfo) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  staff: null,
  isAuthenticated: false,
  isLoading: true,

  setStaff: (staff) => set({ staff, isAuthenticated: true, isLoading: false }),

  clearAuth: () =>
    set({ staff: null, isAuthenticated: false, isLoading: false }),

  setLoading: (isLoading) => set({ isLoading }),
}));
