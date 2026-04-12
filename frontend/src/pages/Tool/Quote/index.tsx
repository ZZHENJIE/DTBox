import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Title, Stack } from "@mantine/core";
import { getThumbnailUrl } from "@/utils/getFinvizThumbnailUrl";
import { useSettingsStore } from "@/stores/settingsStore";
import { SymbolNews } from "./SymbolNews";
import { ThumbnailImage } from "@/components/ThumbnailImage";

export function QuotePage() {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const { settings } = useSettingsStore();

  useEffect(() => {
    if (!symbol) {
      navigate("/quote/SPY", { replace: true });
    }
  }, [symbol, navigate]);

  if (!symbol) {
    return null;
  }

  const thumbnailUrl = getThumbnailUrl(symbol, settings.finviz.thumbnail);

  return (
    <Stack gap="lg">
      <ThumbnailImage ticker={symbol} src={thumbnailUrl} />

      <Title order={3}>Latest News</Title>
      <SymbolNews symbol={symbol} maxHeight={500} />
    </Stack>
  );
}
