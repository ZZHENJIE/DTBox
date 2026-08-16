import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";

import { AppLayout } from "~/components/layout/AppLayout";
import AdminPage from "~/components/pages/AdminPage";
import CalendarPage from "~/components/pages/CalendarPage";
import LoginPage from "~/components/pages/LoginPage";
import QuotePage from "~/components/pages/QuotePage";
import ScreenerPage from "~/components/pages/ScreenerPage";
import SettingsPage from "~/components/pages/SettingsPage";
import TestPage from "~/components/pages/TestPage";
import TimeWindowPage from "~/components/pages/TimeWindowPage";
import UnavailablePage from "~/components/pages/UnavailablePage";
import { useAuth } from "~/hooks/use-auth";
import { isTauri } from "~/lib/tauri";
import { Skeleton } from "~/components/ui/skeleton";

function RequireAuth() {
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

  return <Outlet />;
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
  if (!isTauri()) {
    return <UnavailablePage />;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/screener" element={<ScreenerPage />} />
          <Route path="/quote" element={<QuoteRoute />} />
          <Route path="/calendar/:type" element={<CalendarRoute />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/tools/test" element={<TestPage />} />
        </Route>
        <Route path="/tools/timewindow" element={<TimeWindowPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/screener" replace />} />
    </Routes>
  );
}
