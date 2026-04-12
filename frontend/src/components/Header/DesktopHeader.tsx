import { Group, Button, Text, Menu, Avatar } from "@mantine/core";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { authService } from "../../services/auth";
import { userMenuItems, logo, navItems } from "@/config/Menu";
import { GlobalSearch } from "../GlobalSearch";

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

interface DesktopHeaderProps {
  user: { username: string } | null;
  isAuthenticated: boolean;
}

export function DesktopHeader({ user, isAuthenticated }: DesktopHeaderProps) {
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
    <Group h="100%" px="md" gap="md">
      <Text
        component={Link}
        to={logo.link}
        size="xl"
        fw={700}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        {logo.text}
      </Text>

      <GlobalSearch />

      <Group gap="xs" ml="auto">
        {navItems.map((item, index) => renderNavItem(item, index))}
      </Group>

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
  );
}