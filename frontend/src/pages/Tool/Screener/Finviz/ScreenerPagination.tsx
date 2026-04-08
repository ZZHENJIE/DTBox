import { Group, Pagination, Text } from "@mantine/core";

interface ScreenerPaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  autoRefresh: boolean;
  paused: boolean;
  countdown: number;
  lastUpdate: Date | null;
}

export function ScreenerPagination({
  totalPages,
  currentPage,
  onPageChange,
  autoRefresh,
  paused,
  countdown,
  lastUpdate,
}: ScreenerPaginationProps) {
  if (totalPages <= 0) return null;

  return (
    <Group justify="space-between" mt="md">
      <Group>
        {autoRefresh && !paused && countdown > 0 && (
          <Text c="dimmed">Refresh in {countdown}s</Text>
        )}
      </Group>
      <Pagination
        value={currentPage}
        onChange={onPageChange}
        total={totalPages}
      />
      <Group>
        {lastUpdate && (
          <Text c="dimmed" size="sm">
            Last update: {lastUpdate.toLocaleTimeString()}
          </Text>
        )}
      </Group>
    </Group>
  );
}
