import { Group, Button, Text, Menu, Avatar, rem } from "@mantine/core";
import { Link, useNavigate } from "react-router-dom";
import {
  IconUser,
  IconSettings,
  IconLogout,
  IconChartBar,
  IconChevronDown,
  IconHelp,
  IconTool,
  IconCalendar,
  IconBrandGithub,
  IconInfoCircle,
  IconTopologyRing2,
} from "@tabler/icons-react";

import { useAuthStore } from "../stores/authStore";
import { authService } from "../services/auth";
import menuConfig from "../config/menu.json";

// 图标映射
const iconMap: Record<string, React.ReactNode> = {
  user: <IconUser style={{ width: rem(14), height: rem(14) }} />,
  settings: <IconSettings style={{ width: rem(14), height: rem(14) }} />,
  logout: <IconLogout style={{ width: rem(14), height: rem(14) }} />,
  chartBar: <IconChartBar size={16} />,
  chevronDown: <IconChevronDown size={14} />,
  help: <IconHelp size={14} />,
  tool: <IconTool size={14} />,
  calendar: <IconCalendar size={14} />,
  github: <IconBrandGithub size={14} />,
  info: <IconInfoCircle size={14} />,
  quote: <IconTopologyRing2 size={14} />,
};

interface MenuItem {
  label?: string;
  path?: string;
  icon?: string;
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
            <Button
              variant="subtle"
              rightSection={iconMap[item.icon || "chevronDown"]}
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
                leftSection={child.icon ? iconMap[child.icon] : undefined}
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
        leftSection={item.icon ? iconMap[item.icon] : undefined}
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
        to={menuConfig.logo.link}
        size="xl"
        fw={700}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        {menuConfig.logo.text}
      </Text>

      {/* Navigation */}
      {isAuthenticated && (
        <Group>
          {menuConfig.navItems.map((item, index) => renderNavItem(item, index))}
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
              {menuConfig.userMenuItems.map((item, index) => {
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
                    leftSection={item.icon ? iconMap[item.icon] : undefined}
                  >
                    {item.label}
                  </Menu.Item>
                );
              })}
            </Menu.Dropdown>
          </Menu>
        ) : (
          <Group>
            {menuConfig.guestMenuItems.map((item, index) => (
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
