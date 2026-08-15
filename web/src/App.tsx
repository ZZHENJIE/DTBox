import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";
import type { ReactNode } from "react";

import { AppLayout } from "~/components/layout/AppLayout";
import CalendarPage from "~/components/pages/CalendarPage";
import LoginPage from "~/components/pages/LoginPage";
import QuotePage from "~/components/pages/QuotePage";
import ScreenerPage from "~/components/pages/ScreenerPage";
import SettingsPage from "~/components/pages/SettingsPage";
import { useAuth } from "~/hooks/use-auth";
import { Skeleton } from "~/components/ui/skeleton";

function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex w-full max-w-sm flex-col gap-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    );
  }

  if (status !== "authenticated") {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function QuoteRoute() {
  const location = useLocation();
  const symbol = new URLSearchParams(location.search).get("symbol") ?? "";
  return <QuotePage key={symbol} />;
}

function CalendarRoute() {
  const { type } = useParams();
  return <CalendarPage key={type} />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/screener" element={<ScreenerPage />} />
        <Route path="/quote" element={<QuoteRoute />} />
        <Route path="/calendar/:type" element={<CalendarRoute />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/screener" replace />} />
    </Routes>
  );
}
