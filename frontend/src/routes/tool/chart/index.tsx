import { Container, Stack, Title, Text } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { withAuthGuard } from "#/hooks/withAuthGuard";
import { RequireRole } from "#/components/RequireRole";

function ChartContent() {
  return (
    <Container size="sm" py="xl">
      <Stack>
        <Title order={2}>Chart</Title>
        <Text>Chart page coming soon...</Text>
      </Stack>
    </Container>
  );
}

function Chart() {
  return (
    <RequireRole required={1}>
      <ChartContent />
    </RequireRole>
  );
}

const ProtectedChart = withAuthGuard(Chart);

export const Route = createFileRoute("/tool/chart/")({
  component: ProtectedChart,
});
