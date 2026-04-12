import { Box, SimpleGrid } from "@mantine/core";
import type { FinvizScreenerResult } from "../../../../services/market";
import { type FinvizInterval } from "../../../../stores/settingsStore";
import { getThumbnailUrl } from "../../../../utils/getFinvizThumbnailUrl";
import { ThumbnailImage } from "../../../../components/ThumbnailImage";

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

  const handleDoubleClick = (ticker: string) => {
    window.open(`/quote/${ticker}`, "_blank");
  };

  return (
    <Box style={{ overflowX: "auto" }}>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        {paginatedData.map((item) => {
          const src = getThumbnailUrl(item.Ticker, {
            interval,
            pre_market: preMarket,
            after_hours: afterHours,
          });
          return (
            <ThumbnailImage
              key={item["No."]}
              ticker={item.Ticker}
              src={src}
              onDoubleClick={() => handleDoubleClick(item.Ticker)}
            />
          );
        })}
      </SimpleGrid>
    </Box>
  );
}
