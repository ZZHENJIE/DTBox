import { Group, Button, Text, Menu, Avatar } from "@mantine/core";
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
    // 有子菜单
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

    // 普通菜单项
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

  return (
    <Group h="100%" px="md" justify="space-between">
      {/* Logo */}
      <Text
        component={Link}
        to={logo.link}
        size="xl"
        fw={700}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        {logo.text}
      </Text>

      {/* Navigation */}
      {isAuthenticated && (
        <Group>
          {navItems.map((item, index) => renderNavItem(item, index))}
        </Group>
      )}

      {/* User Menu */}
      <Group>
        {isAuthenticated ? (
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
                    onClick={() => item.action && handleMenuAction(item.action)}
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
          <Group>
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
        )}
      </Group>
    </Group>
  );
}
