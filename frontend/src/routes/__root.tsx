import { MantineProvider, Center, Loader, Box } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import { Outlet } from "@tanstack/react-router";
import { theme } from "#/theme";
import Header from "#/components/Header/index";
import { useInitUser } from "#/hooks/useInitUser";

function Root() {
  const { isLoading } = useInitUser();

  if (isLoading) {
    return (
      <MantineProvider theme={theme} defaultColorScheme="dark">
        <Notifications position="top-right" />
        <Center h="100vh">
          <Loader size="lg" />
        </Center>
      </MantineProvider>
    );
  }

  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Notifications position="top-right" />
      <Header />
      <Box pt="5px">
        <Outlet />
      </Box>
    </MantineProvider>
  );
}

export const Route = Root;
