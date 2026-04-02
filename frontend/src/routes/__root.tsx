import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { NotFound } from "./not_found";
import { theme } from "#/theme";
import Header from "#/components/header";

export const Route = createRootRoute({
  notFoundComponent: NotFound,
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "DTBox",
      },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <Header />
          {children}
        </MantineProvider>
        <Scripts />
      </body>
    </html>
  );
}
