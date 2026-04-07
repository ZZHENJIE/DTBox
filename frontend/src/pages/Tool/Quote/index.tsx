import { Title, Paper, Stack, Text } from "@mantine/core";

export function QuotePage() {
  return (
    <Paper radius="md" p="xl" withBorder maw={500} w="100%">
      <Title order={2} mb="lg">
        Quote
      </Title>

      <Stack gap="md">
        <Text c="dimmed">开发中...</Text>
      </Stack>
    </Paper>
  );
}
