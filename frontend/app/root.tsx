import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
} from "react-router";

import "./app.css";
import type { Route } from "./+types/root";
import Header from "./components/app/header";
import { ThemeProvider } from "~/components/app/theme/theme-provider";
import { Toaster } from "sonner";
import { useLocation } from "react-router";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { getUserField } from "./lib/UserInfo";
import { ScrollArea } from "~/components/ui/scroll-area";
import JWTToken from "./lib/JWTToken";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const publicPaths = ["/", "/about", "/profile"];
    if (publicPaths.includes(location.pathname)) return;

    const checkAuth = async () => {
      const permissions = getUserField("permissions");
      setTimeout(() => {
        if (JWTToken.Get() != "" && permissions != 0) return;
        navigate("no-permission", { replace: true });
      }, 500);
    };

    checkAuth();
  }, [location.pathname]);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="m-1">
        <Header />
        <div className="pt-13">
          <Outlet />
        </div>
      </div>
    </ThemeProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="container mx-auto p-4 pt-16">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full overflow-x-auto p-4">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
