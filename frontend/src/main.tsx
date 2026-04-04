import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { theme } from "./theme";
import Header from "./components/Header";
import { useInitUser } from "./hooks/useInitUser";

const router = createRouter({ routeTree });

function App() {
  useInitUser();

  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Notifications position="top-right" />
      <Header />
      <div style={{ paddingTop: "5px" }}>
        <RouterProvider router={router} />
      </div>
    </MantineProvider>
  );
}

const rootElement = document.getElementById("app");
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
