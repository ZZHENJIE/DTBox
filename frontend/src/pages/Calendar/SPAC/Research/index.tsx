import { Title, Paper, Stack, Text } from "@mantine/core";

export function SPACResearchPage() {
  return (
    <Paper radius="md" p="xl" withBorder maw={500} w="100%">
      <Title order={2} mb="lg">
        SPAC Research
      </Title>

      <Stack gap="md">
        <Text c="dimmed">开发中...</Text>
      </Stack>
    </Paper>
  );
}
