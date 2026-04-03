import { Container, Stack, Title, Text, Button } from "@mantine/core";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/no_permission")({
  component: NoPermission,
});

function NoPermission() {
  const navigate = useNavigate();

  return (
    <Container size="sm" py={80}>
      <Stack align="center" gap="md">
        <Title order={1} c="red">
          Access Denied
        </Title>
        <Text size="lg">You do not have permission to access this page.</Text>
        <Button onClick={() => navigate({ to: "/" })}>Back to Home</Button>
      </Stack>
    </Container>
  );
}
