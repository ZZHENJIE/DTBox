import { useEffect, useRef } from "react";
import { useUserStore } from "#/stores/useUserStore";
import type { UserRole } from "#/stores/useUserStore";
import { authApi, setJwtToken } from "#/services/api";

export function useInitUser() {
  const initialized = useRef(false);
  const { setUser, setLoading, logout, isLoading } = useUserStore();

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initUser = async () => {
      try {
        const token = await authApi.refresh();
        setJwtToken(token);
        const userInfo = await authApi.getUserInfo();
        const permissions = userInfo.permissions as UserRole;
        setUser({
          id: String(userInfo.id),
          username: userInfo.name,
          permissions,
          config: userInfo.config,
          createTime: userInfo.create_time,
        });
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    initUser();
  }, [setUser, setLoading, logout]);

  return { isLoading };
}
