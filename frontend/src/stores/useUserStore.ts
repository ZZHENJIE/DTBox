import { create } from "zustand";

export type UserRole = 0 | 1 | 5;

export interface User {
  id: string;
  username: string;
  permissions: UserRole;
  config: Record<string, unknown>;
  createTime: string;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));

export function hasPermission(required: UserRole): boolean {
  const user = useUserStore.getState().user;
  if (!user) return false;
  return user.permissions >= required;
}
