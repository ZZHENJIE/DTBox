import { Box, Image, Stack } from "@mantine/core";
import type { FinvizScreenerResult } from "../../../../services/market";
import { type FinvizInterval } from "../../../../stores/settingsStore";
import { getThumbnailUrl } from "../../../../utils/getFinvizThumbnailUrl";

interface ScreenerFinvizChartsProps {
  data: FinvizScreenerResult[];
  interval: FinvizInterval;
  preMarket: boolean;
  afterHours: boolean;
}

export function ScreenerFinvizCharts({
  data,
  interval,
  preMarket,
  afterHours,
}: ScreenerFinvizChartsProps) {
  return (
    <Box style={{ height: 500, overflowY: "auto" }}>
      <Stack gap="md">
        {data.map((item) => (
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
