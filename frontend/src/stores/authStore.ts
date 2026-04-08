import { create } from "zustand";

export type UserRole = 0 | 1 | 5;

export interface User {
  id: number;
  username: string;
  permissions: UserRole;
  settings: Record<string, unknown>;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }),

  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),
}));

// Permission helpers
export const hasPermission = (
  user: User | null,
  required: UserRole,
): boolean => {
  if (!user) return false;
  return user.permissions >= required;
};

export const isAdmin = (user: User | null): boolean => {
  return user?.permissions === 5;
};

export const isPremium = (user: User | null): boolean => {
  return (user?.permissions ?? 0) >= 1;
};
