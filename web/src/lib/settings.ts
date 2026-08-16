import type { FinvizInterval, FinvizValidRange } from "~/types/data";
import { isLocale, type Locale } from "~/i18n";
import {
  DEFAULT_INTERVAL,
  DEFAULT_RANGE,
  isFinvizInterval,
  isFinvizValidRange,
} from "./finviz";

export interface ScreenerPreset {
  name: string;
  order_by: string;
  signal: string;
  parameter: string;
}

export interface TimeWindowSettings {
  text_size: number;
  text_color: string;
}

export interface UserSettings {
  chart_interval: FinvizInterval;
  chart_range: FinvizValidRange;
  screener_presets: ScreenerPreset[];
  time_window: TimeWindowSettings;
  language: Locale;
}

export const DEFAULT_SETTINGS: UserSettings = {
  chart_interval: DEFAULT_INTERVAL,
  chart_range: DEFAULT_RANGE,
  screener_presets: [],
  time_window: { text_size: 40, text_color: "#ffffff" },
  language: "en-US",
};

export function parseSettings(
  raw: Record<string, unknown> | undefined,
): UserSettings {
  const rawInterval = raw?.chart_interval;
  const rawRange = raw?.chart_range;

  return {
    chart_interval: isFinvizInterval(rawInterval)
      ? rawInterval
      : DEFAULT_INTERVAL,
    chart_range: isFinvizValidRange(rawRange) ? rawRange : DEFAULT_RANGE,
    screener_presets: parseScreenerPresets(raw?.screener_presets),
    time_window: parseTimeWindow(raw?.time_window),
    language: isLocale(raw?.language) ? raw.language : DEFAULT_SETTINGS.language,
  };
}

function parseTimeWindow(raw: unknown): TimeWindowSettings {
  const defaults = DEFAULT_SETTINGS.time_window;
  if (typeof raw !== "object" || raw === null) return defaults;
  const v = raw as Record<string, unknown>;

  return {
    text_size:
      typeof v.text_size === "number" && Number.isFinite(v.text_size)
        ? v.text_size
        : defaults.text_size,
    text_color:
      typeof v.text_color === "string" ? v.text_color : defaults.text_color,
  };
}

function parseScreenerPresets(raw: unknown): ScreenerPreset[] {
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
