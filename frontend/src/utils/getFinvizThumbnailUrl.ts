/**
 * @param symbol
 * @param period (1m, 3m, 5m, 15m, 30m, 1h, 4h, 1d)
 * @param options
 * @param options.showPreMarket
 * @param options.showPostMarket
 * @returns
 */
export function getFinvizThumbnailUrl(
  symbol: string,
  period: string = "1d",
  options: {
    showPreMarket?: boolean;
    showPostMarket?: boolean;
  } = {},
): string {
  // TODO: 实现缩略图 URL 生成逻辑
  return "";
}
