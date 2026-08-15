import { useEffect, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CandlestickSeries,
  ColorType,
  HistogramSeries,
  createChart,
  type CandlestickData,
  type HistogramData,
  type IChartApi,
  type ISeriesApi,
  type Time,
  type UTCTimestamp,
} from "lightweight-charts";

import { ExternalLink } from "lucide-react";

import { finvizNews, finvizStock, searchStocks } from "~/lib/endpoints";
import { INTERVALS, RANGES, readChartDefaults } from "~/lib/finviz";
import { openUrl } from "~/lib/tauri";
import { useAuth } from "~/hooks/use-auth";
import type { StockItem } from "~/types/api";
import type {
  FinvizInterval,
  FinvizNewsItem,
  FinvizStockItem,
  FinvizValidRange,
} from "~/types/data";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Skeleton } from "~/components/ui/skeleton";

const INTRADAY: FinvizInterval[] = [
  "Minute",
  "Minutes2",
  "Minutes3",
  "Minutes5",
  "Minutes10",
  "Minutes15",
  "Minutes30",
  "Hour",
  "Hour2",
  "Hour4",
];

const selectClass =
  "border-input bg-transparent dark:bg-input/30 h-9 w-full rounded-md border px-3 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none";

interface FinvizDate {
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
}

function parseFinvizDate(raw: string): FinvizDate | null {
  const intraday = raw.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)$/i,
  );
  if (intraday) {
    const month = Number(intraday[1]);
    const day = Number(intraday[2]);
    const year = Number(intraday[3]);
    let hour = Number(intraday[4]);
    const minute = Number(intraday[5]);
    const ampm = intraday[6].toUpperCase();
    if (ampm === "PM" && hour !== 12) hour += 12;
    if (ampm === "AM" && hour === 12) hour = 0;
    return { year, month, day, hour, minute };
  }

  const daily = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (daily) {
    return {
      year: Number(daily[3]),
      month: Number(daily[1]),
      day: Number(daily[2]),
    };
  }

  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    return {
      year: Number(iso[1]),
      month: Number(iso[2]),
      day: Number(iso[3]),
    };
  }

  return null;
}

function toTime(raw: string, intraday: boolean): Time {
  const parsed = parseFinvizDate(raw);
  if (!parsed) {
    return raw as Time;
  }

  const pad = (n: number) => String(n).padStart(2, "0");

  if (intraday) {
    const hour = parsed.hour ?? 0;
    const minute = parsed.minute ?? 0;
    const ms = Date.UTC(parsed.year, parsed.month - 1, parsed.day, hour, minute);
    return Math.floor(ms / 1000) as UTCTimestamp;
  }

  return `${parsed.year}-${pad(parsed.month)}-${pad(parsed.day)}` as Time;
}

export default function QuotePage() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const symbol = (searchParams.get("symbol") ?? "").toUpperCase();

  const defaults = readChartDefaults(user?.settings);
  const [interval, setInterval] = useState<FinvizInterval>(defaults.interval);
  const [range, setRange] = useState<FinvizValidRange>(defaults.range);
  const [data, setData] = useState<FinvizStockItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [stockInfo, setStockInfo] = useState<StockItem | null>(null);
  const [news, setNews] = useState<FinvizNewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chart = createChart(el, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#8fa6bf",
      },
      grid: {
        vertLines: { color: "rgba(36, 54, 75, 0.4)" },
        horzLines: { color: "rgba(36, 54, 75, 0.4)" },
      },
      rightPriceScale: { borderColor: "#24364b" },
      timeScale: { borderColor: "#24364b" },
    });

    const candle = chart.addSeries(CandlestickSeries, {
      upColor: "#34d399",
      downColor: "#f87171",
      borderUpColor: "#34d399",
      borderDownColor: "#f87171",
      wickUpColor: "#34d399",
      wickDownColor: "#f87171",
    });

    const volume = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    });
    volume.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    chartRef.current = chart;
    candleRef.current = candle;
    volumeRef.current = volume;

    return () => {
      chart.remove();
      chartRef.current = null;
      candleRef.current = null;
      volumeRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!candleRef.current || !volumeRef.current) return;

    const intraday = INTRADAY.includes(interval);

    const candles: CandlestickData[] = data.map((d) => ({
      time: toTime(d.Date, intraday),
      open: d.Open,
      high: d.High,
      low: d.Low,
      close: d.Close,
    }));

    const volumes: HistogramData[] = data.map((d) => ({
      time: toTime(d.Date, intraday),
      value: d.Volume,
      color:
        d.Close >= d.Open
          ? "rgba(52, 211, 153, 0.4)"
          : "rgba(248, 113, 113, 0.4)",
    }));

    candleRef.current.setData(candles);
    volumeRef.current.setData(volumes);
    chartRef.current?.timeScale().fitContent();
  }, [data, interval]);

  const load = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!symbol) return;

    setLoading(true);
    setError(null);
    try {
      const res = await finvizStock({
        symbol,
        interval,
        valid_ranges: range,
      });
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!symbol) return;

    void finvizStock({ symbol, interval, valid_ranges: range })
      .then(setData)
      .catch((err) => {
        setError(err instanceof Error ? err.message : String(err));
        setData([]);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            {symbol || "报价"}
          </h1>
          {stockInfo?.name && (
            <p className="text-muted-foreground text-sm">{stockInfo.name}</p>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <form
            onSubmit={load}
            className="flex flex-wrap items-end gap-3"
          >
            <div className="flex w-32 flex-col gap-2">
              <Label htmlFor="chart-interval">周期</Label>
              <select
                id="chart-interval"
                className={selectClass}
                value={interval}
                onChange={(e) => setInterval(e.target.value as FinvizInterval)}
              >
                {INTERVALS.map((it) => (
                  <option key={it.value} value={it.value}>
                    {it.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex w-32 flex-col gap-2">
              <Label htmlFor="chart-range">范围</Label>
              <select
                id="chart-range"
                className={selectClass}
                value={range}
                onChange={(e) => setRange(e.target.value as FinvizValidRange)}
              >
                {RANGES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "加载中…" : "加载"}
            </Button>
          </form>

          {error && <p className="text-destructive text-sm">{error}</p>}

          {symbol ? (
            <div
              ref={containerRef}
              className="h-[480px] w-full rounded-md border"
            />
          ) : (
            <div className="text-muted-foreground flex h-[480px] w-full items-center justify-center rounded-md border text-sm">
              请通过顶部搜索框选择股票
            </div>
          )}
        </CardContent>
      </Card>

      {symbol && (
        <Card>
          <CardHeader>
            <CardTitle>相关新闻</CardTitle>
            <CardDescription>{symbol} 的最新动态</CardDescription>
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
              <p className="text-muted-foreground text-sm">暂无新闻</p>
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
                      title="打开链接"
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
