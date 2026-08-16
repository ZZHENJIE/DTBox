import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  HistogramSeries,
  createChart,
  type CandlestickData,
  type HistogramData,
  type IChartApi,
  type ISeriesApi,
  type MouseEventParams,
  type Time,
  type UTCTimestamp,
} from "lightweight-charts";

import { finvizStock } from "~/lib/endpoints";
import { cn } from "~/lib/utils";
import type {
  FinvizInterval,
  FinvizStockItem,
  FinvizValidRange,
} from "~/types/data";
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
    const hour = Number(intraday[4]);
    const minute = Number(intraday[5]);
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

interface KlineChartProps {
  symbol: string;
  interval: FinvizInterval;
  range: FinvizValidRange;
  className?: string;
}

export function KlineChart({
  symbol,
  interval,
  range,
  className,
}: KlineChartProps) {
  const { t } = useTranslation();
  const [data, setData] = useState<FinvizStockItem[]>([]);
  const [loaded, setLoaded] = useState<{
    symbol: string;
    interval: FinvizInterval;
    range: FinvizValidRange;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hover, setHover] = useState<{
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  } | null>(null);

  const loading =
    loaded === null ||
    loaded.symbol !== symbol ||
    loaded.interval !== interval ||
    loaded.range !== range;

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
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: "rgba(36, 54, 75, 0.4)" },
        horzLines: { color: "rgba(36, 54, 75, 0.4)" },
      },
      rightPriceScale: { borderColor: "#24364b" },
      timeScale: { borderColor: "#24364b" },
      crosshair: { mode: CrosshairMode.Normal },
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

    const handleCrosshairMove = (param: MouseEventParams) => {
      if (!param.time || !param.point) {
        setHover(null);
        return;
      }
      const candleData = param.seriesData.get(candle) as
        | { open: number; high: number; low: number; close: number }
        | undefined;
      const volumeData = param.seriesData.get(volume) as
        | { value: number }
        | undefined;
      if (!candleData) {
        setHover(null);
        return;
      }
      setHover({
        open: candleData.open,
        high: candleData.high,
        low: candleData.low,
        close: candleData.close,
        volume: volumeData?.value ?? 0,
      });
    };

    chart.subscribeCrosshairMove(handleCrosshairMove);

    return () => {
      chart.unsubscribeCrosshairMove(handleCrosshairMove);
      chart.remove();
      chartRef.current = null;
      candleRef.current = null;
      volumeRef.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    finvizStock({ symbol, interval, valid_ranges: range })
      .then((res) => {
        if (cancelled) return;
        setData(res);
        setError(null);
        setLoaded({ symbol, interval, range });
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
        setData([]);
        setLoaded({ symbol, interval, range });
      });

    return () => {
      cancelled = true;
    };
  }, [symbol, interval, range]);

  useEffect(() => {
    if (!candleRef.current || !volumeRef.current) return;

    const intraday = INTRADAY.includes(interval);

    const rows = data
      .map((d) => ({ d, t: toTime(d.Date, intraday) }))
      .sort((a, b) => {
        if (typeof a.t === "number" && typeof b.t === "number") {
          return a.t - b.t;
        }
        return String(a.t).localeCompare(String(b.t));
      });

    const candles: CandlestickData[] = rows.map(({ d, t }) => ({
      time: t,
      open: d.Open,
      high: d.High,
      low: d.Low,
      close: d.Close,
    }));

    const volumes: HistogramData[] = rows.map(({ d, t }) => ({
      time: t,
      value: d.Volume,
      color:
        d.Close >= d.Open
          ? "rgba(52, 211, 153, 0.4)"
          : "rgba(248, 113, 113, 0.4)",
    }));

    candleRef.current.setData(candles);
    volumeRef.current.setData(volumes);
    chartRef.current?.timeScale().applyOptions({ timeVisible: intraday });
    chartRef.current?.timeScale().fitContent();
  }, [data, interval]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div ref={containerRef} className="h-full w-full" />
      {hover && (
        <div className="pointer-events-none absolute top-2 left-2 z-10 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border bg-card/90 px-2 py-1 font-mono text-xs">
          <span className="text-muted-foreground">
            {t("chart.open")}{" "}
            <span className="text-foreground">{hover.open}</span>
          </span>
          <span className="text-muted-foreground">
            {t("chart.high")}{" "}
            <span className="text-emerald-400">{hover.high}</span>
          </span>
          <span className="text-muted-foreground">
            {t("chart.low")} <span className="text-red-400">{hover.low}</span>
          </span>
          <span className="text-muted-foreground">
            {t("chart.close")}{" "}
            <span className="text-foreground">{hover.close}</span>
          </span>
          <span className="text-muted-foreground">
            {t("chart.volume")}{" "}
            <span className="text-foreground">{hover.volume.toLocaleString()}</span>
          </span>
        </div>
      )}
      {loading && (
        <div className="absolute inset-0">
          <Skeleton className="h-full w-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-muted-foreground animate-pulse text-sm">
              {t("common.loading")}
            </span>
          </div>
        </div>
      )}
      {!loading && error && (
        <div className="text-destructive absolute inset-0 flex items-center justify-center text-sm">
          {error}
        </div>
      )}
      {!loading && !error && data.length === 0 && (
        <div className="text-muted-foreground absolute inset-0 flex items-center justify-center text-sm">
          {t("common.noData")}
        </div>
      )}
    </div>
  );
}
