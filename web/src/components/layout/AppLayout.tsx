import { Outlet } from "react-router-dom";
import { Header } from "./Header";

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="px-6 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
