import { Box, Image, Stack } from "@mantine/core";
import type { FinvizScreenerResult } from "../../../../services/market";
import { type FinvizInterval } from "../../../../stores/settingsStore";
import { getThumbnailUrl } from "../../../../utils/getFinvizThumbnailUrl";

interface ScreenerFinvizChartsProps {
  data: FinvizScreenerResult[];
  interval: FinvizInterval;
  preMarket: boolean;
  afterHours: boolean;
  pageSize: number;
  currentPage: number;
}

export function ScreenerFinvizCharts({
  data,
  interval,
  preMarket,
  afterHours,
  pageSize,
  currentPage,
}: ScreenerFinvizChartsProps) {
  const paginatedData = data.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <Box style={{ overflowX: "auto" }}>
      <Stack gap="md">
        {paginatedData.map((item) => (
          <Image
            key={item["No."]}
            src={getThumbnailUrl(item.Ticker, {
              interval,
              pre_market: preMarket,
              after_hours: afterHours,
            })}
            alt={item.Ticker}
            radius="md"
          />
        ))}
      </Stack>
    </Box>
  );
}
