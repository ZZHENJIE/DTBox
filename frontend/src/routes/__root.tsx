import { MantineProvider, Center, Loader } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import NotFound from "#/view/not_found";
import { theme } from "#/theme";
import Header from "#/components/Header/index.tsx";
import { useInitUser } from "#/hooks/useInitUser";

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
  const { isLoading } = useInitUser();

  if (isLoading) {
    return (
      <html lang="en" suppressHydrationWarning>
        <head>
          <HeadContent />
        </head>
        <body>
          <MantineProvider theme={theme} defaultColorScheme="dark">
            <Notifications position="top-right" />
            <Center h="100vh">
              <Loader size="lg" />
            </Center>
          </MantineProvider>
          <Scripts />
        </body>
      </html>
    );
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="dark">
          <Notifications position="top-right" />
          <Header />
          {children}
        </MantineProvider>
        <Scripts />
      </body>
    </html>
  );
}
