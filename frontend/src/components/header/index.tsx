import {
  Group,
  Container,
  Title,
  Anchor,
  Image,
  Avatar,
  Menu,
  UnstyledButton,
  ActionIcon,
} from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronUp } from "lucide-react";
import HeaderNav from "./HeaderNav";
import HeaderSearch from "./HeaderSearch";
import HeaderCollapsed from "./HeaderCollapsed";
import { useUserStore } from "#/stores/useUserStore";
import { authApi } from "#/services/api";

function Header() {
  const { user, isAuthenticated, logout } = useUserStore();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      logout();
      window.location.href = "/user/login";
    }
  };

  return (
    <Container
      size="xl"
      px="md"
      py="sm"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        backgroundColor: "#2e2a1a",
        borderLeft: "2px solid rgba(255,255,255,0.1)",
        borderRight: "2px solid rgba(255,255,255,0.1)",
        borderBottom: "2px solid rgba(255,255,255,0.1)",
        borderRadius: "0 0 12px 12px",
      }}
    >
      {collapsed ? (
        <HeaderCollapsed onExpand={() => setCollapsed(false)} />
      ) : (
        <Group h={56} justify="space-between">
          <Group gap="md">
            <Anchor component={Link} to="/" underline="never" c="gray.0">
              <Group gap="sm">
                <Image src="/favicon.ico" w={36} h={36} />
                <Title order={2} fw={700} c="gray.0">
                  DTBox
                </Title>
              </Group>
            </Anchor>
            <HeaderSearch />
          </Group>
          <Group gap="md">
            <HeaderNav />
            {isAuthenticated && user && (
              <Menu trigger="hover">
                <Menu.Target>
                  <UnstyledButton>
                    <Avatar color="blue" size="md">
                      {user.username.charAt(0).toUpperCase()}
                    </Avatar>
                  </UnstyledButton>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>{user.username}</Menu.Label>
                  <Menu.Item component={Link} to="/user/profile">
                    Profile
                  </Menu.Item>
                  <Menu.Item component={Link} to="/user/settings">
                    Settings
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item color="red" onClick={handleLogout}>
                    Logout
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}
            <ActionIcon
              variant="subtle"
              onClick={() => setCollapsed(true)}
              title="Collapse"
            >
              <ChevronUp size={20} />
            </ActionIcon>
          </Group>
        </Group>
      )}
    </Container>
  );
}

export default Header;
