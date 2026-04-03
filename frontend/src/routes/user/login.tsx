import {
  Button,
  Center,
  Container,
  Loader,
  Stack,
  TextInput,
  Title,
  Text,
  Group,
} from "@mantine/core";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { authApi, setJwtToken } from "#/services/api";
import { useUserStore } from "#/stores/useUserStore";
import type { UserRole } from "#/stores/useUserStore";

export const Route = createFileRoute("/user/login")({
  component: LoginPage,
});

function LoginPage() {
  const { isAuthenticated, isLoading } = useUserStore();
  const setUser = useUserStore((s) => s.setUser);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      window.location.href = "/";
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <Center h="calc(100vh - 100px)">
        <Loader />
      </Center>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await authApi.login(username, password);
      const token = await authApi.refresh();
      setJwtToken(token);
      const userInfo = await authApi.getUserInfo();
      const permissions = userInfo.permissions as UserRole;
      setUser({
        id: String(userInfo.id),
        username: userInfo.name,
        permissions,
        config: userInfo.config,
        createTime: userInfo.create_time,
      });
      window.location.href = "/";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="xs" py={80}>
      <Stack>
        <Title ta="center">Login</Title>
        <TextInput
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextInput
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <Button onClick={handleLogin} loading={loading}>
          Login
        </Button>
        <Group justify="center">
          <Text size="sm">Don't have an account?</Text>
          <Text
            component={Link}
            to="/user/register"
            size="sm"
            c="blue"
            style={{ cursor: "pointer" }}
          >
            Register
          </Text>
        </Group>
      </Stack>
    </Container>
  );
}
