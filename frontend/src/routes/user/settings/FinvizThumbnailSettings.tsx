import { useEffect } from "react";
import { Title, Switch, Text, Select, Group } from "@mantine/core";
import { useUserStore } from "#/stores/useUserStore";
import type { Period } from "#/utils/getFinvizThumbnailUrl";

const TIME_OPTIONS = [
  { value: "i1", label: "1 Minute" },
  { value: "i3", label: "3 Minutes" },
  { value: "i5", label: "5 Minutes" },
  { value: "i15", label: "15 Minutes" },
  { value: "i30", label: "30 Minutes" },
  { value: "h", label: "1 Hour" },
  { value: "d", label: "1 Day" },
  { value: "w", label: "1 Week" },
  { value: "m", label: "1 Month" },
];

interface ThumbnailData {
  period: Period;
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
      onChange({ period: thumbnail.period as Period });
    }
    if (thumbnail?.preMarket !== undefined) {
      onChange({ preMarket: thumbnail.preMarket as boolean });
    }
    if (thumbnail?.postMarket !== undefined) {
      onChange({ postMarket: thumbnail.postMarket as boolean });
    }
  }, []);

  const showPrePostOption = data.period !== "d";

  return (
    <>
      <Title order={4}>Thumbnail</Title>

      <Group>
        <Select
          label="Period"
          value={data.period}
          onChange={(v) => onChange({ period: (v || "d") as Period })}
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
