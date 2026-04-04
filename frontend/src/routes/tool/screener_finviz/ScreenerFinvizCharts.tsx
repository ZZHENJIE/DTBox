import { Box, Image, Stack } from "@mantine/core";
import type { ScreenerFinvizItem } from "#/services/api";
import { getFinvizThumbnailUrl } from "#/utils/getFinvizThumbnailUrl";
import type { Period } from "#/utils/getFinvizThumbnailUrl";

interface ScreenerFinvizChartsProps {
  data: ScreenerFinvizItem[];
  period: Period;
  preMarket: boolean;
  postMarket: boolean;
}

export function ScreenerFinvizCharts({
  data,
  period,
  preMarket,
  postMarket,
}: ScreenerFinvizChartsProps) {
  return (
    <Box style={{ height: 500, overflowY: "auto" }}>
      <Stack gap="md">
        {data.map((item) => (
          <Image
            key={item["No."]}
            src={getFinvizThumbnailUrl(item.Ticker, period, {
              showPreMarket: preMarket,
              showPostMarket: postMarket,
            })}
            alt={item.Ticker}
            radius="md"
          />
        ))}
      </Stack>
    </Box>
  );
}
