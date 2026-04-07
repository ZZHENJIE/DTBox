import { Container, Title, Text, Stack } from '@mantine/core';

export function HomePage() {
  return (
    <Container py="xl">
      <Stack>
        <Title>欢迎使用 DTBox</Title>
        <Text c="dimmed">
          DTBox 是一款用于美股日内交易的工具软件，提供实时行情、数据分析等功能。
        </Text>
      </Stack>
    </Container>
  );
}
