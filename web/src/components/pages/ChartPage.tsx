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

import { finvizStock } from "~/lib/endpoints";
import type {
  FinvizInterval,
  FinvizStockItem,
  FinvizValidRange,
} from "~/types/data";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

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

const INTERVALS: { value: FinvizInterval; label: string }[] = [
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

const RANGES: { value: FinvizValidRange; label: string }[] = [
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

const selectClass =
  "border-input bg-transparent dark:bg-input/30 h-9 w-full rounded-md border px-3 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none";

function toTime(raw: string, intraday: boolean): Time {
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m && !intraday) {
    return `${m[1]}-${m[2]}-${m[3]}` as Time;
  }
  const d = new Date(raw.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) {
    return raw as Time;
  }
  return Math.floor(d.getTime() / 1000) as UTCTimestamp;
}

export default function ChartPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [symbol, setSymbol] = useState(
    (searchParams.get("symbol") ?? "").toUpperCase(),
  );
  const [interval, setInterval] = useState<FinvizInterval>("Day");
  const [range, setRange] = useState<FinvizValidRange>("Year");
  const [data, setData] = useState<FinvizStockItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    const sym = symbol.trim().toUpperCase();
    if (!sym) return;

    setSearchParams({ symbol: sym });
    setLoading(true);
    setError(null);
    try {
      const res = await finvizStock({
        symbol: sym,
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
    const initial = (searchParams.get("symbol") ?? "").toUpperCase();
    if (!initial) return;

    void finvizStock({ symbol: initial, interval, valid_ranges: range })
      .then(setData)
      .catch((err) => {
        setError(err instanceof Error ? err.message : String(err));
        setData([]);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">K 线图</h1>
        <p className="text-muted-foreground text-sm">lightweight-charts 渲染</p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <form
            onSubmit={load}
            className="flex flex-wrap items-end gap-3"
          >
            <div className="flex w-40 flex-col gap-2">
              <Label htmlFor="chart-symbol">代码</Label>
              <Input
                id="chart-symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="AAPL"
              />
            </div>
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

          <div
            ref={containerRef}
            className="h-[480px] w-full rounded-md border"
          />
        </CardContent>
      </Card>
    </div>
  );
}
