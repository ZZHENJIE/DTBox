export type Period =
  | "i1" // 1 Minute
  | "i3" // 3 Minutes
  | "i5" // 5 Minutes
  | "i15" // 15 Minutes
  | "i30" // 30 Minutes
  | "h" // 1 Hour
  | "d" // 1 Day
  | "w" // 1 Week
  | "m"; // 1 Month

/**
 * @param symbol
 * @param period
 * @param options
 * @param options.showPreMarket
 * @param options.showPostMarket
 * @returns
 */
export function getFinvizThumbnailUrl(
  symbol: string,
  period: Period,
  options: {
    showPreMarket?: boolean;
    showPostMarket?: boolean;
  } = {},
): string {
  const params = new URLSearchParams({
    cs: "l",
    t: symbol,
    tf: period,
    pm: options.showPreMarket ? "240" : "0",
    am: options.showPostMarket ? "1200" : "0",
    ct: "candle_stick",
    tm: "d",
  });
  return `https://charts-node.finviz.com/chart.ashx?${params.toString()}`;
}
