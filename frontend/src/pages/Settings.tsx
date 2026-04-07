import {
  Title,
  Stack,
  Paper,
  Text,
} from '@mantine/core';

export function SettingsPage() {
  return (
    <Paper radius="md" p="xl" withBorder maw={500} w="100%">
      <Title order={2} mb="lg">
        设置
      </Title>

      <Stack gap="md">
        <Text c="dimmed">设置功能开发中...</Text>
      </Stack>
    </Paper>
  );
}
