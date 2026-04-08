import { AppShell } from "@mantine/core";
import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Header } from "./components/Header";
import { useAuthStore } from "./stores/authStore";
import {
  useSettingsStore,
  DEFAULT_SETTINGS,
  type UserSettings,
} from "./stores/settingsStore";
import { authService } from "./services/auth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicRoute } from "./components/PublicRoute";
import { routes } from "./config/Routes";

function App() {
  const { isLoading, setLoading, setUser, logout } = useAuthStore();
  const { setSettings } = useSettingsStore();

  // Initialize auth on app start
  useEffect(() => {
    const initAuth = async () => {
      try {
        await authService.refreshToken();
        const user = await authService.getCurrentUser();
        setUser(user);

        // Initialize settings from user data
        if (user?.settings && typeof user.settings === "object") {
          const userSettings = user.settings as Partial<UserSettings>;
          const mergedSettings: UserSettings = {
            finviz: {
              screener: {
                page_count:
                  userSettings.finviz?.screener?.page_count ??
                  DEFAULT_SETTINGS.finviz.screener.page_count,
                auto_refersh:
                  userSettings.finviz?.screener?.auto_refersh ??
                  DEFAULT_SETTINGS.finviz.screener.auto_refersh,
                parameter:
                  userSettings.finviz?.screener?.parameter ??
                  DEFAULT_SETTINGS.finviz.screener.parameter,
              },
              thumbnail: {
                interval:
                  userSettings.finviz?.thumbnail?.interval ??
                  DEFAULT_SETTINGS.finviz.thumbnail.interval,
                pre_market:
                  userSettings.finviz?.thumbnail?.pre_market ??
                  DEFAULT_SETTINGS.finviz.thumbnail.pre_market,
                after_hours:
                  userSettings.finviz?.thumbnail?.after_hours ??
                  DEFAULT_SETTINGS.finviz.thumbnail.after_hours,
              },
            },
            subscription:
              userSettings.subscription ?? DEFAULT_SETTINGS.subscription,
          };
          setSettings(mergedSettings);
        }
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [setUser, logout, setLoading, setSettings]);

  if (isLoading) {
    return null;
  }

  // 分离普通路由和 404 路由
  const normalRoutes = routes.filter((r) => r.path !== "*");

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Header />
      </AppShell.Header>

      <AppShell.Main>
        <div style={{ padding: "0 6px" }}>
          <Routes>
            {normalRoutes.map((route, index) => {
              const Component = route.component;

              // 登录/注册页面 - 已登录用户重定向到首页
              if (route.path === "/login" || route.path === "/register") {
                return (
                  <Route
                    key={index}
                    path={route.path}
                    element={
                      <PublicRoute>
                        <Component />
                      </PublicRoute>
                    }
                  />
                );
              }

              // 404、无权限页面 - 已登录用户也可以访问
              if (route.path === "/404" || route.path === "/no-permission") {
                return (
                  <Route
                    key={index}
                    path={route.path}
                    element={
                      <PublicRoute allowAuthenticated>
                        <Component />
                      </PublicRoute>
                    }
                  />
                );
              }

              // 其他受保护的路由
              return (
                <Route
                  key={index}
                  path={route.path}
                  element={
                    <ProtectedRoute requiredRole={route.auth}>
                      <Component />
                    </ProtectedRoute>
                  }
                />
              );
            })}

            {/* 404 - 放在最后 */}
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </div>
      </AppShell.Main>
    </AppShell>
  );
}

export default App;
