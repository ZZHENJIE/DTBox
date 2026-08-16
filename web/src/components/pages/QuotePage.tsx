import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ExternalLink } from "lucide-react";

import { KlineChart } from "~/components/charts/KlineChart";
import { finvizNews, searchStocks } from "~/lib/endpoints";
import { INTERVALS, RANGES } from "~/lib/finviz";
import { parseSettings } from "~/lib/settings";
import { openUrl } from "~/lib/tauri";
import { useAuth } from "~/hooks/use-auth";
import type { StockItem } from "~/types/api";
import type {
  FinvizInterval,
  FinvizNewsItem,
  FinvizValidRange,
} from "~/types/data";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Skeleton } from "~/components/ui/skeleton";

const selectClass =
  "border-input bg-transparent dark:bg-input/30 h-9 w-full rounded-md border px-3 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none";

export default function QuotePage() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { t } = useTranslation();
  const symbol = (searchParams.get("symbol") ?? "").toUpperCase();

  const settings = parseSettings(user?.settings);
  const [interval, setInterval] = useState<FinvizInterval>(
    settings.chart_interval,
  );
  const [range, setRange] = useState<FinvizValidRange>(settings.chart_range);

  const [stockInfo, setStockInfo] = useState<StockItem | null>(null);
  const [news, setNews] = useState<FinvizNewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) return;

    let cancelled = false;
    searchStocks(symbol, 1, 1)
      .then((res) => {
        if (cancelled) return;
        const match =
          res.stocks.find((s) => s.symbol === symbol) ?? res.stocks[0] ?? null;
        setStockInfo(match);
      })
      .catch(() => {
        if (!cancelled) setStockInfo(null);
      });

    return () => {
      cancelled = true;
    };
  }, [symbol]);

  useEffect(() => {
    if (!symbol) return;

    let cancelled = false;
    finvizNews({ Stocks: { symbol: [symbol], category: "NoETF" } })
      .then((res) => {
        if (!cancelled) setNews(res);
      })
      .catch((err) => {
        if (!cancelled) {
          setNewsError(err instanceof Error ? err.message : String(err));
        }
      })
      .finally(() => {
        if (!cancelled) setNewsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [symbol]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Avatar className="size-12 rounded-lg">
          <AvatarImage src={stockInfo?.logo} alt={symbol} />
          <AvatarFallback className="rounded-lg">
            {symbol ? symbol.slice(0, 1).toUpperCase() : "?"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-semibold leading-tight">
            {symbol || t("quote.title")}
          </h1>
          {stockInfo?.name && (
            <p className="text-muted-foreground text-sm">{stockInfo.name}</p>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex w-32 flex-col gap-2">
              <Label htmlFor="chart-interval">{t("quote.interval")}</Label>
              <select
                id="chart-interval"
                className={selectClass}
                value={interval}
                onChange={(e) => setInterval(e.target.value as FinvizInterval)}
              >
                {INTERVALS.map((it) => (
                  <option key={it.value} value={it.value}>
                    {t(it.label)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex w-32 flex-col gap-2">
              <Label htmlFor="chart-range">{t("quote.range")}</Label>
              <select
                id="chart-range"
                className={selectClass}
                value={range}
                onChange={(e) => setRange(e.target.value as FinvizValidRange)}
              >
                {RANGES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {t(r.label)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {symbol ? (
            <KlineChart
              symbol={symbol}
              interval={interval}
              range={range}
              className="h-[480px] w-full rounded-md border"
            />
          ) : (
            <div className="text-muted-foreground flex h-[480px] w-full items-center justify-center rounded-md border text-sm">
              {t("quote.selectHint")}
            </div>
          )}
        </CardContent>
      </Card>

      {symbol && (
        <Card>
          <CardHeader>
            <CardTitle>{t("quote.relatedNews")}</CardTitle>
            <CardDescription>{t("quote.newsDesc", { symbol })}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {newsLoading && (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            )}

            {!newsLoading && newsError && (
              <p className="text-destructive text-sm">{newsError}</p>
            )}

            {!newsLoading && !newsError && news.length === 0 && (
              <p className="text-muted-foreground text-sm">{t("quote.noNews")}</p>
            )}

            {!newsLoading && news.length > 0 && (
              <ul className="flex h-80 flex-col divide-y overflow-y-auto rounded-md border">
                {news.map((item, i) => (
                  <li
                    key={`${item.Title}-${i}`}
                    className="flex items-center gap-3 px-3 py-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => void openUrl(item.Url)}
                        className="hover:text-primary truncate text-sm font-medium hover:underline"
                      >
                        {item.Title}
                      </button>
                      <div className="text-muted-foreground flex gap-2 text-xs">
                        <span>{item.Source}</span>
                        <span>{item.Date}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => void openUrl(item.Url)}
                      title={t("quote.openLink")}
                    >
                      <ExternalLink className="text-muted-foreground size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
