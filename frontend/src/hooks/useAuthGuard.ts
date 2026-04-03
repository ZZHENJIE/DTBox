import { useUserStore } from "#/stores/useUserStore";

export function useAuthGuard() {
  const { isAuthenticated, isLoading } = useUserStore();

  if (isLoading) {
    return { allowed: false, redirect: null };
  }

  if (!isAuthenticated) {
    return { allowed: false, redirect: "/login" };
  }

  return { allowed: true, redirect: null };
}
