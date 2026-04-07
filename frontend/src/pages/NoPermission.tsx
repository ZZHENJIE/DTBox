import {
  Title,
  Text,
  Button,
  Stack,
  Paper,
  Center,
} from '@mantine/core';
import { Link } from 'react-router-dom';
import { IconLock } from '@tabler/icons-react';

export function NoPermissionPage() {
  return (
    <Center h="calc(100vh - 200px)">
      <Paper radius="md" p="xl" withBorder maw={400} w="100%">
        <Stack align="center" gap="md">
          <IconLock size={64} color="var(--mantine-color-red-6)" />
          
          <Title order={2} ta="center">
            无权限访问
          </Title>
          
          <Text c="dimmed" ta="center">
            您没有权限访问此页面，请联系管理员获取相应权限。
          </Text>
          
          <Button component={Link} to="/">
            返回首页
          </Button>
        </Stack>
      </Paper>
    </Center>
  );
}
