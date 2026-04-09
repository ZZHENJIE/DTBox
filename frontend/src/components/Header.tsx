import {
  Group,
  Button,
  Text,
  Menu,
  Avatar,
  Burger,
  Drawer,
  Stack,
  Divider,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { Link, useNavigate } from "react-router-dom";

import { useAuthStore } from "../stores/authStore";
import { authService } from "../services/auth";
import { guestMenuItems, logo, navItems, userMenuItems } from "@/config/Menu";

interface MenuItem {
  label?: string;
  path?: string;
  icon?: React.ReactNode;
  action?: string;
  color?: string;
  variant?: string;
  type?: string;
  children?: MenuItem[];
}

export function Header() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore errors
    }
    logout();
    navigate("/login");
  };

  const handleMenuAction = (action: string) => {
    switch (action) {
      case "logout":
        handleLogout();
        break;
      default:
        break;
    }
  };

  const renderNavItem = (item: MenuItem, index: number) => {
    if (item.children && item.children.length > 0) {
      return (
        <Menu shadow="md" key={index}>
          <Menu.Target>
            <Button variant="subtle" rightSection={item.icon}>
              {item.label}
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            {item.children.map((child, childIndex) => (
              <Menu.Item
                key={childIndex}
                component={Link}
                to={child.path || "#"}
                leftSection={child.icon}
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
      >
        {item.label}
      </Button>
    );
  };

  const renderMobileNavItem = (item: MenuItem, index: number) => {
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
            {item.children.map((child, childIndex) => (
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

  return (
    <>
      <Group h="100%" px="md" justify={isDesktop ? "space-between" : "center"}>
        {!isDesktop && isAuthenticated && (
          <Burger
            opened={drawerOpened}
            onClick={toggleDrawer}
            hiddenFrom="md"
            size="sm"
            style={{ position: "absolute", left: 0 }}
          />
        )}

        <Text
          component={Link}
          to={logo.link}
          size="xl"
          fw={700}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          {logo.text}
        </Text>

        {isAuthenticated && (
          <Group gap="xs" visibleFrom="md">
            {navItems.map((item, index) => renderNavItem(item, index))}
          </Group>
        )}

        <Group
          gap="xs"
          style={!isDesktop ? { position: "absolute", right: 0 } : undefined}
        >
          {isAuthenticated ? (
            isDesktop ? (
              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <Button variant="subtle">
                    <Avatar size="sm" radius="xl" mr="xs">
                      {user?.username.charAt(0).toUpperCase()}
                    </Avatar>
                    {user?.username}
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
                        onClick={() =>
                          item.action && handleMenuAction(item.action)
                        }
                        color={item.color}
                        leftSection={item.icon}
                      >
                        {item.label}
                      </Menu.Item>
                    );
                  })}
                </Menu.Dropdown>
              </Menu>
            ) : (
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
                        onClick={() =>
                          item.action && handleMenuAction(item.action)
                        }
                        color={item.color}
                        leftSection={item.icon}
                      >
                        {item.label}
                      </Menu.Item>
                    );
                  })}
                </Menu.Dropdown>
              </Menu>
            )
          ) : isDesktop ? (
            <Group gap="xs">
              {guestMenuItems.map((item, index) => (
                <Button
                  key={index}
                  component={Link}
                  to={item.path}
                  variant={item.variant || "filled"}
                >
                  {item.label}
                </Button>
              ))}
            </Group>
          ) : null}
        </Group>
      </Group>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="xs"
        padding="md"
        title={logo.text}
        hiddenFrom="md"
        styles={{
          body: { padding: 0 },
        }}
      >
        <Stack>
          <Divider />
          {navItems.map((item, index) => renderMobileNavItem(item, index))}
          {!isAuthenticated && (
            <>
              <Divider />
              {guestMenuItems.map((item, index) => (
                <Button
                  key={index}
                  component={Link}
                  to={item.path}
                  variant={item.variant || "filled"}
                  onClick={closeDrawer}
                >
                  {item.label}
                </Button>
              ))}
            </>
          )}
        </Stack>
      </Drawer>
    </>
  );
}
