import { useState, useEffect } from "react";
import {
  Title,
  Paper,
  Stack,
  Text,
  Badge,
  Loader,
  Group,
  Center,
  Anchor,
  Image,
  Divider,
  Button,
  Modal,
  ScrollArea,
} from "@mantine/core";
import { IconHistory } from "@tabler/icons-react";
import { healthService, type HealthStatus } from "../../services/market";
import { ChangelogModalContent } from "./ChangelogModalContent";

export function AboutPage() {
  const [changelogOpened, setChangelogOpened] = useState(false);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    healthService
      .checkHealth()
      .then(setHealth)
      .catch((err) => setError(err instanceof Error ? err.message : "获取失败"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Center p="md">
      <Paper radius="md" p="xl" withBorder maw={600} w="100%">
        <Group justify="space-between" align="flex-start" mb="lg">
          <Title order={2} mb={0}>
            关于
          </Title>
          <Button
            size="sm"
            variant="light"
            leftSection={<IconHistory size={16} />}
            onClick={() => setChangelogOpened(true)}
          >
            更新日志
          </Button>
        </Group>

        <Center mb="xl">
          <Group gap="md" align="center">
            <Image
              src="/favicon.ico"
              w={60}
              h={60}
              radius="md"
              alt="DTBox Logo"
            />
            <div>
              <Title order={3}>DTBox</Title>
              <Text size="sm" c="dimmed">
                美股数据分析和投资工具平台
              </Text>
            </div>
          </Group>
        </Center>

        <Stack gap="md">
          <Divider />

          <div>
            <Text fw={500} mb="xs">
              前端技术栈
            </Text>
            <Group gap="xs">
              <Badge variant="light">React 19</Badge>
              <Badge variant="light">TypeScript</Badge>
              <Badge variant="light">Mantine</Badge>
              <Badge variant="light">Vite</Badge>
              <Badge variant="light">Zustand</Badge>
            </Group>
          </div>

          <div>
            <Text fw={500} mb="xs">
              后端技术栈
            </Text>
            <Group gap="xs">
              <Badge variant="light">Rust</Badge>
              <Badge variant="light">Axum</Badge>
              <Badge variant="light">Sea-orm</Badge>
              <Badge variant="light">SQLite</Badge>
              <Badge variant="light">Tokio</Badge>
            </Group>
          </div>

          <Group>
            <Text fw={500} w={70}>
              版本
            </Text>
            {loading ? (
              <Loader size="xs" />
            ) : error ? (
              <Text c="red" size="sm">
                {error}
              </Text>
            ) : (
              (health?.version ?? "-")
            )}
          </Group>

          <Group>
            <Text fw={500} w={70}>
              状态
            </Text>
            {loading ? (
              <Loader size="xs" />
            ) : error ? (
              <Badge color="red">{error}</Badge>
            ) : (
              <Badge color={health?.status === "ok" ? "green" : "yellow"}>
                {health?.status ?? "-"}
              </Badge>
            )}
          </Group>

          <Divider />

          <div>
            <Text fw={500} mb="xs">
              联系方式 / 反馈
            </Text>
            <Stack gap="xs">
              <Group gap="xs">
                <Text size="sm" fw={500} w={50}>
                  Bilibili
                </Text>
                <Anchor
                  href="https://space.bilibili.com/1362205077"
                  target="_blank"
                  underline="hover"
                >
                  Jonuk
                </Anchor>
              </Group>
              <Group gap="xs">
                <Text size="sm" fw={500} w={50}>
                  QQ
                </Text>
                <Text>1712881363</Text>
              </Group>
              <Group gap="xs">
                <Text size="sm" fw={500} w={50}>
                  GitHub
                </Text>
                <Anchor
                  href="https://github.com/ZZHENJIE/DTBox/issues"
                  target="_blank"
                  underline="hover"
                >
                  Issues
                </Anchor>
              </Group>
            </Stack>
          </div>

          <div>
            <Text fw={500} mb="xs">
              作者
            </Text>
            <Anchor
              href="https://github.com/ZZHENJIE"
              target="_blank"
              underline="hover"
            >
              @ZZHENJIE
            </Anchor>
          </div>

          <Divider />

          <Modal
            opened={changelogOpened}
            onClose={() => setChangelogOpened(false)}
            title={health?.version}
            size="lg"
            scrollAreaComponent={ScrollArea.Autosize}
          >
            <ChangelogModalContent version={health?.version} />
          </Modal>

          <Text size="sm" c="dimmed" ta="center">
            © 2026 DTBox. All rights reserved.
          </Text>
        </Stack>
      </Paper>
    </Center>
  );
}
