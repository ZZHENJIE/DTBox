import {
  Container,
  Stack,
  Title,
  TextInput,
  Button,
  Text,
  List,
} from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { withAuthGuard } from "#/hooks/withAuthGuard";
import { useUserStore } from "#/stores/useUserStore";
import { authApi } from "#/services/api";
import { useState, useEffect } from "react";

function Profile() {
  const { user } = useUserStore();
  const [name, setName] = useState(user?.username || "");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState("");
  const [nameExists, setNameExists] = useState(false);

  const isSameAsCurrent = name === user?.username;

  const nameRegex = /^[a-zA-Z0-9_]+$/;
  const isValidFormat = nameRegex.test(name);
  const isValidLength = name.length >= 5 && name.length <= 15;
  const isValid = isValidFormat && isValidLength;

  useEffect(() => {
    if (isSameAsCurrent || !name.trim() || !isValid) {
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
  }, [name, isSameAsCurrent, isValid]);

  const canSave = !nameExists && !isSameAsCurrent && isValid && !checking;

  const handleSave = async () => {
    if (!canSave) return;
    setLoading(true);
    setMessage("");
    try {
      await authApi.changeName(name);
      setMessage("Name updated successfully");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to update name");
    } finally {
      setLoading(false);
    }
  };

  const requirements = [
    { label: "5-15 characters", met: isValidLength },
    { label: "Letters, numbers and underscores only", met: isValidFormat },
    {
      label: "Username not taken",
      met: !nameExists && !checking && name.length > 0,
    },
  ];

  const roleLabels: Record<number, string> = {
    0: "Regular User",
    1: "Subscriber",
    5: "Admin",
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  return (
    <Container size="sm" py="xl">
      <Stack>
        <Title order={2}>Profile</Title>
        <Text>Role: {roleLabels[user?.permissions ?? 0] || "Unknown"}</Text>
        {user?.createTime ? (
          <Text>Created: {formatDate(user.createTime)}</Text>
        ) : (
          <Text>Created: Loading...</Text>
        )}
        <TextInput
          label="Username"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <List spacing="xs" size="sm">
          {requirements.map((req, i) => (
            <List.Item
              key={i}
              icon={
                <Text c={req.met ? "green" : "red"} fw={700}>
                  {req.met ? "✓" : "✗"}
                </Text>
              }
            >
              <Text c={req.met ? "green" : "red"}>{req.label}</Text>
            </List.Item>
          ))}
        </List>
        <Button onClick={handleSave} loading={loading} disabled={!canSave}>
          Save
        </Button>
        {message && <Text>{message}</Text>}
      </Stack>
    </Container>
  );
}

const ProtectedProfile = withAuthGuard(Profile);

export const Route = createFileRoute("/user/profile/")({
  component: ProtectedProfile,
});
