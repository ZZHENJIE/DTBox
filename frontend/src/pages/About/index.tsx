import { useState, useEffect } from "react";
import {
  Title,
  Paper,
  Stack,
  Text,
  Badge,
  Loader,
  Table,
  Center,
} from "@mantine/core";
import { healthService, type HealthStatus } from "../../services/market";

export function AboutPage() {
  return (
    <Center h="calc(100vh - 120px)">
      <Paper radius="md" p="xl" withBorder maw={600} w="100%">
        <Title order={2} mb="lg">
          关于
        </Title>

        <Stack gap="lg">
          <Text>DTBox 是一个功能强大的股票数据分析和投资工具平台。</Text>

          <Table striped>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td fw={500}>版本</Table.Td>
                <AboutVersion />
              </Table.Tr>
              <Table.Tr>
                <Table.Td fw={500}>状态</Table.Td>
                <AboutStatus />
              </Table.Tr>
            </Table.Tbody>
          </Table>

          <Text size="sm" c="dimmed">
            © 2026 DTBox. All rights reserved.
          </Text>
        </Stack>
      </Paper>
    </Center>
  );
}

function AboutVersion() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    healthService
      .checkHealth()
      .then(setHealth)
      .finally(() => setLoading(false));
  }, []);

  return loading ? <Loader size="xs" /> : (health?.version ?? "-");
}

function AboutStatus() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    healthService
      .checkHealth()
      .then(setHealth)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "获取健康状态失败"),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader size="xs" />;
  if (error) return <Badge color="red">{error}</Badge>;
  return (
    <Badge color={health?.status === "ok" ? "green" : "yellow"}>
      {health?.status ?? "-"}
    </Badge>
  );
}
