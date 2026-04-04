import { useState } from "react";
import {
  Container,
  Stack,
  Title,
  Text,
  Loader,
  Center,
  Button,
} from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { withAuthGuard } from "#/hooks/withAuthGuard";
import { useUserStore } from "#/stores/useUserStore";
import { authApi } from "#/services/api";
import { ScreenerFinvizSettings } from "./ScreenerFinvizSettings";
import { FinvizThumbnailSettings } from "./FinvizThumbnailSettings";

function Settings() {
  const { user, setUser } = useUserStore();
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [screenerData, setScreenerData] = useState({
    params: [] as { query: string; label: string }[],
    pageSize: 20,
    autoRefresh: false,
    autoRefreshInterval: 60,
  });
  const [thumbnailData, setThumbnailData] = useState({
    period: "1d",
    preMarket: false,
    postMarket: false,
  });

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const config = {
        finviz: {
          screener: screenerData,
          thumbnail: thumbnailData,
        },
      };
      await authApi.changeConfig(config);
      if (user) {
        setUser({ ...user, config: { ...user.config, ...config } });
      }
      setMessage("Settings saved successfully");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const updateScreenerData = (data: Partial<typeof screenerData>) => {
    setScreenerData((prev) => ({ ...prev, ...data }));
  };

  const updateThumbnailData = (data: Partial<typeof thumbnailData>) => {
    setThumbnailData((prev) => ({ ...prev, ...data }));
  };

  if (!user) {
    return (
      <Center mt="xl">
        <Loader size="sm" />
      </Center>
    );
  }

  return (
    <Container size="sm" py="xl">
      <Stack>
        <Title order={2}>Settings</Title>

        <Title order={3}>Finviz</Title>

        <ScreenerFinvizSettings
          data={screenerData}
          onChange={updateScreenerData}
        />

        <FinvizThumbnailSettings
          data={thumbnailData}
          onChange={updateThumbnailData}
        />

        {message && (
          <Text c={message.includes("success") ? "green" : "red"}>
            {message}
          </Text>
        )}

        <Button onClick={handleSave} loading={saving}>
          Save Settings
        </Button>
      </Stack>
    </Container>
  );
}

const ProtectedSettings = withAuthGuard(Settings);

export const Route = createFileRoute("/user/settings/")({
  component: ProtectedSettings,
});
