import { DEFAULT_SETTINGS, FINVIZ_INTERVAL_MAP } from "@/stores/settingsStore";

export function getThumbnailUrl(
  symbol: string,
  options?: typeof DEFAULT_SETTINGS.finviz.thumbnail,
): string {
  const opt = options ?? DEFAULT_SETTINGS.finviz.thumbnail;
  const params = new URLSearchParams({
    cs: "l",
    t: symbol,
    tf: FINVIZ_INTERVAL_MAP[opt.interval],
    pm: opt.pre_market ? "240" : "0",
    am: opt.after_hours ? "1200" : "0",
    ct: "candle_stick",
    tm: "d",
  });
  return `https://charts-node.finviz.com/chart.ashx?${params.toString()}`;
}
