import type { FinvizInterval, FinvizValidRange } from "~/types/data";

export const INTERVALS: { value: FinvizInterval; label: string }[] = [
  { value: "Minute", label: "1 分" },
  { value: "Minutes5", label: "5 分" },
  { value: "Minutes15", label: "15 分" },
  { value: "Minutes30", label: "30 分" },
  { value: "Hour", label: "1 时" },
  { value: "Hour4", label: "4 时" },
  { value: "Day", label: "日线" },
  { value: "Week", label: "周线" },
  { value: "Month", label: "月线" },
];

export const RANGES: { value: FinvizValidRange; label: string }[] = [
  { value: "Day", label: "1 天" },
  { value: "Day5", label: "5 天" },
  { value: "Month", label: "1 月" },
  { value: "Month3", label: "3 月" },
  { value: "Month6", label: "6 月" },
  { value: "YearToDate", label: "年初至今" },
  { value: "Year", label: "1 年" },
  { value: "Year2", label: "2 年" },
  { value: "Year5", label: "5 年" },
  { value: "Max", label: "全部" },
];

export const DEFAULT_INTERVAL: FinvizInterval = "Day";
export const DEFAULT_RANGE: FinvizValidRange = "Year";

const INTERVAL_VALUES: string[] = INTERVALS.map((i) => i.value);
const RANGE_VALUES: string[] = RANGES.map((r) => r.value);

export function isFinvizInterval(value: unknown): value is FinvizInterval {
  return typeof value === "string" && INTERVAL_VALUES.includes(value);
}

export function isFinvizValidRange(value: unknown): value is FinvizValidRange {
  return typeof value === "string" && RANGE_VALUES.includes(value);
}

export interface ChartDefaults {
  interval: FinvizInterval;
  range: FinvizValidRange;
}

export function readChartDefaults(
  settings: Record<string, unknown> | undefined,
): ChartDefaults {
  const rawInterval = settings?.chart_interval;
  const rawRange = settings?.chart_range;

  return {
    interval: isFinvizInterval(rawInterval) ? rawInterval : DEFAULT_INTERVAL,
    range: isFinvizValidRange(rawRange) ? rawRange : DEFAULT_RANGE,
  };
}

export interface ScreenerPreset {
  name: string;
  order_by: string;
  signal: string;
  parameter: string;
}

export function readScreenerPresets(
  settings: Record<string, unknown> | undefined,
): ScreenerPreset[] {
  const raw = settings?.screener_presets;
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item): ScreenerPreset | null => {
      if (typeof item !== "object" || item === null) return null;
      const v = item as Record<string, unknown>;
      if (
        typeof v.name !== "string" ||
        typeof v.order_by !== "string" ||
        typeof v.signal !== "string" ||
        typeof v.parameter !== "string"
      ) {
        return null;
      }
      return {
        name: v.name,
        order_by: v.order_by,
        signal: v.signal,
        parameter: v.parameter,
      };
    })
    .filter((item): item is ScreenerPreset => item !== null);
}
