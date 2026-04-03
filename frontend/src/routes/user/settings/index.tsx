import {
  Container,
  Stack,
  Title,
  Text,
  Button,
  NumberInput,
  Switch,
  Group,
} from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { withAuthGuard } from "#/hooks/withAuthGuard";
import { useUserStore } from "#/stores/useUserStore";
import { authApi } from "#/services/api";
import { useState } from "react";

interface UserConfig {
  notifications?: boolean;
  compactMode?: boolean;
  itemsPerPage?: number;
}

function Settings() {
  const { user, setUser } = useUserStore();
  const initialConfig = user?.config as UserConfig | undefined;
  const [config, setConfig] = useState<UserConfig>(initialConfig ?? {});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (key: keyof UserConfig, value: unknown) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage("");
    try {
      await authApi.changeConfig(config as unknown as Record<string, unknown>);
      if (user) {
        setUser({ ...user, config: config as Record<string, unknown> });
      }
      setMessage("Settings saved successfully");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="sm" py="xl">
      <Stack>
        <Title order={2}>Settings</Title>

        <Group justify="space-between">
          <Text fw={500}>Notifications</Text>
          <Switch
            checked={config.notifications || false}
            onChange={(e) => handleChange("notifications", e.target.checked)}
          />
        </Group>

        <Group justify="space-between">
          <Text fw={500}>Compact Mode</Text>
          <Switch
            checked={config.compactMode || false}
            onChange={(e) => handleChange("compactMode", e.target.checked)}
          />
        </Group>

        <NumberInput
          label="Items Per Page"
          value={config.itemsPerPage || 10}
          onChange={(value) => handleChange("itemsPerPage", value)}
          min={5}
          max={100}
        />

        {message && (
          <Text c={message.includes("success") ? "green" : "red"}>
            {message}
          </Text>
        )}

        <Button
          onClick={handleSave}
          loading={loading}
          style={{ alignSelf: "flex-end" }}
        >
          Apply Changes
        </Button>
      </Stack>
    </Container>
  );
}

const ProtectedSettings = withAuthGuard(Settings);

export const Route = createFileRoute("/user/settings/")({
  component: ProtectedSettings,
});
