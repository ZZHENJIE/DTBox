import { Button, Center, Container, Stack, Text, Title } from "@mantine/core";
import { Link } from "@tanstack/react-router";

function NotFoundPage() {
  return (
    <Container size="sm" py={80}>
      <Center>
        <Stack align="center" gap="lg">
          <img
            src="/404.svg"
            alt="Not Found"
            style={{ maxWidth: 300, width: "100%", borderRadius: 16 }}
          />
          <Title order={2} ta="center">
            Page Not Found
          </Title>
          <Text c="dimmed" size="lg" ta="center">
            The page you're looking for doesn't exist or has been moved.
          </Text>
          <Button component={Link} to="/" size="md" variant="filled" mt="md">
            Back to Home
          </Button>
        </Stack>
      </Center>
    </Container>
  );
}

export default NotFoundPage;
