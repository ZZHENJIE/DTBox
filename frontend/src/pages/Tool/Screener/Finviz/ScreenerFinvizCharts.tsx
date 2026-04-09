import { Box, Image, Stack, Skeleton, Center } from "@mantine/core";
import { useState } from "react";
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

function ChartImage({
  ticker,
  interval,
  preMarket,
  afterHours,
}: {
  ticker: string;
  interval: FinvizInterval;
  preMarket: boolean;
  afterHours: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const src = getThumbnailUrl(ticker, {
    interval,
    pre_market: preMarket,
    after_hours: afterHours,
  });

  return (
    <Box pos="relative">
      {!loaded && <Skeleton h={340} radius="md" />}
      <Center>
        <Image
          src={src}
          alt={ticker}
          radius="md"
          onLoad={() => setLoaded(true)}
          style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.2s" }}
        />
      </Center>
    </Box>
  );
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
          <ChartImage
            key={item["No."]}
            ticker={item.Ticker}
            interval={interval}
            preMarket={preMarket}
            afterHours={afterHours}
          />
        ))}
      </Stack>
    </Box>
  );
}
