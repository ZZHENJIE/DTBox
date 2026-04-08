import { DEFAULT_SETTINGS, FINVIZ_INTERVAL_MAP } from "@/stores/settingsStore";

export function getThumbnailUrl(
  symbol: string,
  options: typeof DEFAULT_SETTINGS.finviz.thumbnail,
): string {
  const params = new URLSearchParams({
    cs: "l",
    t: symbol,
    tf: FINVIZ_INTERVAL_MAP[options.interval],
    pm: options.pre_market ? "240" : "0",
    am: options.after_hours ? "1200" : "0",
    ct: "candle_stick",
    tm: "d",
  });
  return `https://charts-node.finviz.com/chart.ashx?${params.toString()}`;
}
