import { Container, Title, Text, Button, Center } from '@mantine/core';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <Center h="calc(100vh - 100px)">
      <Container ta="center">
        <Title order={1} size={120} c="dimmed">
          404
        </Title>
        <Title order={2} mb="md">
          页面未找到
        </Title>
        <Text c="dimmed" mb="xl">
          您访问的页面不存在或已被移除
        </Text>
        <Button component={Link} to="/">
          返回首页
        </Button>
      </Container>
    </Center>
  );
}
