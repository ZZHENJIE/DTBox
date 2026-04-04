import { useEffect } from "react";
import { Title, Switch, Text, Select, Group } from "@mantine/core";
import { useUserStore } from "#/stores/useUserStore";

const TIME_OPTIONS = [
  { value: "1m", label: "1 Minute" },
  { value: "3m", label: "3 Minutes" },
  { value: "5m", label: "5 Minutes" },
  { value: "15m", label: "15 Minutes" },
  { value: "30m", label: "30 Minutes" },
  { value: "1h", label: "1 Hour" },
  { value: "4h", label: "4 Hours" },
  { value: "1d", label: "1 Day" },
];

interface ThumbnailData {
  period: string;
  preMarket: boolean;
  postMarket: boolean;
}

interface FinvizThumbnailSettingsProps {
  data: ThumbnailData;
  onChange: (data: Partial<ThumbnailData>) => void;
}

export function FinvizThumbnailSettings({
  data,
  onChange,
}: FinvizThumbnailSettingsProps) {
  const { user } = useUserStore();

  useEffect(() => {
    const config = user?.config as Record<string, unknown> | undefined;
    const finviz = config?.finviz as Record<string, unknown> | undefined;
    const thumbnail = finviz?.thumbnail as Record<string, unknown> | undefined;

    if (thumbnail?.period) {
      onChange({ period: thumbnail.period as string });
    }
    if (thumbnail?.preMarket !== undefined) {
      onChange({ preMarket: thumbnail.preMarket as boolean });
    }
    if (thumbnail?.postMarket !== undefined) {
      onChange({ postMarket: thumbnail.postMarket as boolean });
    }
  }, []);

  const showPrePostOption = data.period !== "1d";

  return (
    <>
      <Title order={4}>Thumbnail</Title>

      <Group>
        <Select
          label="Period"
          value={data.period}
          onChange={(v) => onChange({ period: v || "1d" })}
          data={TIME_OPTIONS}
          style={{ width: 150 }}
        />

        {showPrePostOption && (
          <>
            <Switch
              checked={data.preMarket}
              onChange={(e) => onChange({ preMarket: e.target.checked })}
            />
            <Text size="sm">Pre Market</Text>

            <Switch
              checked={data.postMarket}
              onChange={(e) => onChange({ postMarket: e.target.checked })}
            />
            <Text size="sm">Post Market</Text>
          </>
        )}
      </Group>
    </>
  );
}
