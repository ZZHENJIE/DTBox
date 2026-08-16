import type { FinvizInterval, FinvizValidRange } from "~/types/data";

export const INTERVALS: { value: FinvizInterval; label: string }[] = [
  { value: "Minute", label: "interval.Minute" },
  { value: "Minutes5", label: "interval.Minutes5" },
  { value: "Minutes15", label: "interval.Minutes15" },
  { value: "Minutes30", label: "interval.Minutes30" },
  { value: "Hour", label: "interval.Hour" },
  { value: "Hour4", label: "interval.Hour4" },
  { value: "Day", label: "interval.Day" },
  { value: "Week", label: "interval.Week" },
  { value: "Month", label: "interval.Month" },
];

export const RANGES: { value: FinvizValidRange; label: string }[] = [
  { value: "Day", label: "range.Day" },
  { value: "Day5", label: "range.Day5" },
  { value: "Month", label: "range.Month" },
  { value: "Month3", label: "range.Month3" },
  { value: "Month6", label: "range.Month6" },
  { value: "YearToDate", label: "range.YearToDate" },
  { value: "Year", label: "range.Year" },
  { value: "Year2", label: "range.Year2" },
  { value: "Year5", label: "range.Year5" },
  { value: "Max", label: "range.Max" },
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
