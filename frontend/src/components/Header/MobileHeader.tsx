import {
  Group,
  Button,
  Menu,
  Avatar,
  Burger,
  Drawer,
  Stack,
  Divider,
  Box,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { authService } from "../../services/auth";
import { logo, navItems, userMenuItems } from "@/config/Menu";
import { GlobalSearch } from "../GlobalSearch";

interface MobileHeaderProps {
  isAuthenticated: boolean;
  user: { username: string } | null;
}

export function MobileHeader({ isAuthenticated, user }: MobileHeaderProps) {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleMenuAction = async (action: string) => {
    if (action === "logout") {
      try {
        await authService.logout();
      } catch {
        // Ignore
      }
      logout();
      navigate("/login");
    }
  };

  const renderMobileNavItem = (item: any, index: number) => {
    if (item.children && item.children.length > 0) {
      return (
        <Menu shadow="md" key={index} width={200}>
          <Menu.Target>
            <Button
              variant="subtle"
              fullWidth
              justify="flex-start"
              rightSection={item.icon}
            >
              {item.label}
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            {item.children.map((child: any, childIndex: number) => (
              <Menu.Item
                key={childIndex}
                component={Link}
                to={child.path || "#"}
                leftSection={child.icon}
                onClick={closeDrawer}
              >
                {child.label}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      );
    }

    return (
      <Button
        key={index}
        component={Link}
        to={item.path || "#"}
        variant="subtle"
        leftSection={item.icon}
        onClick={closeDrawer}
        fullWidth
        justify="flex-start"
      >
        {item.label}
      </Button>
    );
  };

  if (!isAuthenticated) {
    return (
      <Group h="100%" px="md" justify="center">
        <Text
          component={Link}
          to={logo.link}
          size="xl"
          fw={700}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          {logo.text}
        </Text>
      </Group>
    );
  }

  return (
    <>
      <Group h="100%" px="md" gap="md">
        <Burger opened={drawerOpened} onClick={toggleDrawer} size="sm" />

        <Box style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <Box w={180}>
            <GlobalSearch />
          </Box>
        </Box>

        <Menu shadow="md" width={200}>
          <Menu.Target>
            <Button variant="subtle" px="xs">
              <Avatar size="sm" radius="xl">
                {user?.username.charAt(0).toUpperCase()}
              </Avatar>
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            {userMenuItems.map((item, index) => {
              if (item.type === "divider") {
                return <Menu.Divider key={index} />;
              }
              return (
                <Menu.Item
                  key={index}
                  component={Link}
                  to={item.path || "#"}
                  color={item.color}
                  leftSection={item.icon}
                  onClick={() => item.action && handleMenuAction(item.action)}
                >
                  {item.label}
                </Menu.Item>
              );
            })}
          </Menu.Dropdown>
        </Menu>
      </Group>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="xs"
        padding="md"
        title={
          <Text
            component={Link}
            to={logo.link}
            size="xl"
            fw={700}
            style={{ textDecoration: "none", color: "inherit" }}
            onClick={closeDrawer}
          >
            {logo.text}
          </Text>
        }
        styles={{
          body: { padding: 0 },
        }}
      >
        <Stack>
          <Divider />
          {navItems.map((item, index) => renderMobileNavItem(item, index))}
        </Stack>
      </Drawer>
    </>
  );
}