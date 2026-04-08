import { useState, useEffect } from "react";
import { Title, Stack, Paper, Button, Group } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";

import {
  useSettingsStore,
  DEFAULT_SETTINGS,
  type UserSettings,
} from "../../stores/settingsStore";
import { useAuthStore } from "../../stores/authStore";
import { authService } from "../../services/auth";
import { FinvizSettings } from "./Finviz";

export function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const { settings, setSettings } = useSettingsStore();

  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);

  // 从用户配置初始化
  useEffect(() => {
    if (user?.settings && typeof user.settings === "object") {
      const userSettings = user.settings as Partial<UserSettings>;
      const mergedSettings: UserSettings = {
        finviz: {
          screener: {
            page_count:
              userSettings.finviz?.screener?.page_count ??
              DEFAULT_SETTINGS.finviz.screener.page_count,
            auto_refersh:
              userSettings.finviz?.screener?.auto_refersh ??
              DEFAULT_SETTINGS.finviz.screener.auto_refersh,
            parameter:
              userSettings.finviz?.screener?.parameter ??
              DEFAULT_SETTINGS.finviz.screener.parameter,
          },
          thumbnail: {
            interval:
              userSettings.finviz?.thumbnail?.interval ??
              DEFAULT_SETTINGS.finviz.thumbnail.interval,
            pre_market:
              userSettings.finviz?.thumbnail?.pre_market ??
              DEFAULT_SETTINGS.finviz.thumbnail.pre_market,
            after_hours:
              userSettings.finviz?.thumbnail?.after_hours ??
              DEFAULT_SETTINGS.finviz.thumbnail.after_hours,
          },
        },
        subscription:
          userSettings.subscription ?? DEFAULT_SETTINGS.subscription,
      };
      setLocalSettings(mergedSettings);
      setSettings(mergedSettings);
    }
  }, [user?.settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedUser = await authService.updateSettings(localSettings);
      setUser(updatedUser);
      setSettings(localSettings);
      notifications.show({
        title: "成功",
        message: "设置已保存",
        color: "green",
        icon: <IconCheck size={16} />,
      });
    } catch (error) {
      notifications.show({
        title: "失败",
        message: error instanceof Error ? error.message : "保存设置失败",
        color: "red",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setLocalSettings(DEFAULT_SETTINGS);
    notifications.show({
      title: "提示",
      message: "已重置为默认设置",
      color: "blue",
    });
  };

  const handleSettingsChange = (newSettings: UserSettings) => {
    setLocalSettings(newSettings);
  };

  return (
    <Stack gap="xl">
      <Paper withBorder radius="md" p="xl">
        <Title mb="lg" ta="center">
          Finviz
        </Title>
        <FinvizSettings
          settings={localSettings}
          onChange={handleSettingsChange}
        />
      </Paper>

      {/* 保存按钮 */}
      <Group justify="flex-end">
        <Button variant="outline" onClick={handleReset}>
          重置为默认
        </Button>
        <Button loading={isSaving} onClick={handleSave}>
          保存设置
        </Button>
      </Group>
    </Stack>
  );
}
