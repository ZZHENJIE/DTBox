import { Box, Text, Center } from "@mantine/core";
import type { ScreenerFinvizItem } from "#/services/api";

interface ScreenerFinvizChartsProps {
  data: ScreenerFinvizItem[];
}

export function ScreenerFinvizCharts({ data }: ScreenerFinvizChartsProps) {
  return (
    <Box>
      <Center h={500}>
        <Text c="dimmed">Charts view - {data.length} items</Text>
      </Center>
    </Box>
  );
}
