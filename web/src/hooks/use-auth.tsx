import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { clearTokenCache } from "~/lib/api";
import { me } from "~/lib/endpoints";
import {
  doLogin,
  doLogout,
  doRegister,
  getAccessToken,
  getUserId,
  isTauri,
} from "~/lib/tauri";
import type { InfoResult } from "~/types/api";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  user: InfoResult | null;
  userId: string | null;
  login: (name: string, password: string) => Promise<void>;
  register: (name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<InfoResult | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    try {
      const info = await me();
      setUser(info);
    } catch {
      setUser(null);
    }
    try {
      const id = await getUserId();
      setUserId(id);
    } catch {
      setUserId(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!isTauri()) {
        if (import.meta.env.DEV) {
          setStatus("authenticated");
          setUserId(null);
          setUser(null);
        } else {
          setStatus("unauthenticated");
        }
        return;
      }

      try {
        await getAccessToken();
        if (!cancelled) {
          setStatus("authenticated");
        }
        await loadUser();
      } catch {
        if (!cancelled) {
          setStatus("unauthenticated");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loadUser]);

  const login = useCallback(
    async (name: string, password: string) => {
      const id = await doLogin(name, password);
      setUserId(id);
      setStatus("authenticated");
      await loadUser();
    },
    [loadUser],
  );

  const register = useCallback(
    async (name: string, password: string) => {
      await doRegister(name, password);
      await login(name, password);
    },
    [login],
  );

  const logout = useCallback(async () => {
    await doLogout();
    clearTokenCache();
    setUser(null);
    setUserId(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, userId, login, register, logout }),
    [status, user, userId, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
