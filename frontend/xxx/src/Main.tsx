import { createRoot } from "react-dom/client";
import Router from "./utils/Router.tsx";
import { RouterProvider } from "react-router";
import { ThemeProvider } from "@/components/theme-provider.tsx"

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={Router()}></RouterProvider>
);
