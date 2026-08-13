import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

import { AppLayout } from "~/components/layout/AppLayout";
import CalendarPage from "~/components/pages/CalendarPage";
import ChartPage from "~/components/pages/ChartPage";
import DashboardPage from "~/components/pages/DashboardPage";
import DocsPage from "~/components/pages/DocsPage";
import LoginPage from "~/components/pages/LoginPage";
import StockSearchPage from "~/components/pages/StockSearchPage";
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

function ChartRoute() {
  const location = useLocation();
  const symbol = new URLSearchParams(location.search).get("symbol") ?? "";
  return <ChartPage key={symbol} />;
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
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/chart" element={<ChartRoute />} />
        <Route path="/search" element={<StockSearchPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/docs" element={<DocsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
