import {
  Button,
  Center,
  Container,
  Loader,
  Stack,
  TextInput,
  PasswordInput,
  Title,
  Text,
  Group,
  List,
} from "@mantine/core";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { authApi, setJwtToken } from "#/services/api";
import { useUserStore } from "#/stores/useUserStore";
import type { UserRole } from "#/stores/useUserStore";

export const Route = createFileRoute("/user/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const { isLoading, isAuthenticated } = useUserStore();
  const setUser = useUserStore((s) => s.setUser);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [nameExists, setNameExists] = useState(false);

  const nameRegex = /^[a-zA-Z0-9_]+$/;
  const isValidFormat = nameRegex.test(name);
  const isValidLength = name.length >= 5 && name.length <= 15;
  const isValid = isValidFormat && isValidLength;
  const passwordsMatch = password === confirmPassword;
  const isPasswordValid = password.length >= 8 && password.length <= 20;

  useEffect(() => {
    if (!isValid || !name.trim()) {
      setNameExists(false);
      return;
    }
    const timer = setTimeout(async () => {
      setChecking(true);
      try {
        const exists = await authApi.checkUsernameExists(name);
        setNameExists(exists);
      } catch {
        setNameExists(false);
      } finally {
        setChecking(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [name, isValid]);

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

  const canRegister =
    isValid &&
    !nameExists &&
    passwordsMatch &&
    isPasswordValid &&
    !checking &&
    !loading;

  const handleRegister = async () => {
    if (!canRegister) return;
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await authApi.register(name, password);
      await authApi.login(name, password);
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
      setError(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const nameRequirements = [
    { label: "5-15 characters", met: isValidLength },
    { label: "Letters, numbers and underscores only", met: isValidFormat },
    {
      label: "Username not taken",
      met: !nameExists && !checking && name.length > 0,
    },
  ];

  const passwordRequirements = [
    { label: "8-20 characters", met: isPasswordValid },
    {
      label: "Passwords match",
      met: passwordsMatch || confirmPassword.length === 0,
    },
  ];

  return (
    <Container size="xs" py={80}>
      <Stack>
        <Title ta="center">Register</Title>

        <TextInput
          label="Username"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <List spacing="xs" size="sm">
          {nameRequirements.map((req, i) => (
            <List.Item
              key={i}
              icon={
                <Text c={req.met ? "green" : "gray"} fw={700}>
                  {req.met ? "✓" : "○"}
                </Text>
              }
            >
              <Text c={req.met ? "green" : "gray"} size="sm">
                {req.label}
              </Text>
            </List.Item>
          ))}
        </List>

        <PasswordInput
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <List spacing="xs" size="sm">
          {passwordRequirements.map((req, i) => (
            <List.Item
              key={i}
              icon={
                <Text c={req.met ? "green" : "gray"} fw={700}>
                  {req.met ? "✓" : "○"}
                </Text>
              }
            >
              <Text c={req.met ? "green" : "gray"} size="sm">
                {req.label}
              </Text>
            </List.Item>
          ))}
        </List>

        <PasswordInput
          label="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {error && <p style={{ color: "red" }}>{error}</p>}
        {message && <p style={{ color: "green" }}>{message}</p>}

        <Button
          onClick={handleRegister}
          loading={loading}
          disabled={!canRegister}
        >
          Register
        </Button>

        <Group justify="center">
          <Text size="sm">Already have an account?</Text>
          <Text
            component={Link}
            to="/user/login"
            size="sm"
            c="blue"
            style={{ cursor: "pointer" }}
          >
            Login
          </Text>
        </Group>
      </Stack>
    </Container>
  );
}
