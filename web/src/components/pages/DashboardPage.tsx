import { useState, type FormEvent } from "react";
import { ExternalLink, RefreshCw } from "lucide-react";

import { alpacaSnapshot, finvizNews, finvizScreener } from "~/lib/endpoints";
import type {
  AlpacaFeed,
  AlpacaSnapshot,
  FinvizNewsItem,
  FinvizScreenerItem,
} from "~/types/data";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Skeleton } from "~/components/ui/skeleton";

const FEEDS: { value: AlpacaFeed; label: string }[] = [
  { value: "Sip", label: "SIP" },
  { value: "Iex", label: "IEX" },
  { value: "DelayedSip", label: "Delayed SIP" },
  { value: "Otc", label: "OTC" },
];

const selectClass =
  "border-input bg-transparent dark:bg-input/30 flex h-9 w-full rounded-md border px-3 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Finviz / Alpaca 数据看板
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SnapshotCard />
        <ScreenerCard />
      </div>

      <NewsCard />
    </div>
  );
}

function SnapshotCard() {
  const [symbol, setSymbol] = useState("AAPL");
  const [feed, setFeed] = useState<AlpacaFeed>("Sip");
  const [snapshot, setSnapshot] = useState<AlpacaSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSnapshot = async (e?: FormEvent) => {
    e?.preventDefault();
    const sym = symbol.trim().toUpperCase();
    if (!sym) return;

    setLoading(true);
    setError(null);
    try {
      const res = await alpacaSnapshot({ symbol: sym, feed, currency: "USD" });
      setSnapshot(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setSnapshot(null);
    } finally {
      setLoading(false);
    }
  };

  const trade = snapshot?.latestTrade;
  const quote = snapshot?.latestQuote;
  const daily = snapshot?.dailyBar;
  const prevDaily = snapshot?.prevDailyBar;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alpaca 快照</CardTitle>
        <CardDescription>实时报价与当日 K 线</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form onSubmit={fetchSnapshot} className="flex items-end gap-3">
          <div className="flex flex-1 flex-col gap-2">
            <Label htmlFor="snap-symbol">代码</Label>
            <Input
              id="snap-symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="AAPL"
            />
          </div>
          <div className="flex w-32 flex-col gap-2">
            <Label htmlFor="snap-feed">Feed</Label>
            <select
              id="snap-feed"
              className={selectClass}
              value={feed}
              onChange={(e) => setFeed(e.target.value as AlpacaFeed)}
            >
              {FEEDS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <RefreshCw className="animate-spin" />
            ) : (
              <RefreshCw />
            )}
            查询
          </Button>
        </form>

        {loading && <Skeleton className="h-28 w-full" />}

        {!loading && error && (
          <p className="text-destructive text-sm">{error}</p>
        )}

        {!loading && snapshot && (
          <div className="flex flex-col gap-2 rounded-md border p-4 text-sm">
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-semibold">{snapshot.symbol}</span>
              {daily && (
                <span
                  className={
                    prevDaily && daily.c >= prevDaily.c
                      ? "text-emerald-400"
                      : "text-red-400"
                  }
                >
                  {daily.c.toFixed(2)}
                </span>
              )}
            </div>

            {trade && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">最新成交</span>
                <span>
                  {trade.p.toFixed(2)} × {trade.s}
                </span>
              </div>
            )}

            {quote && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">买卖盘</span>
                <span>
                  {quote.bp.toFixed(2)} / {quote.ap.toFixed(2)}
                </span>
              </div>
            )}

            {daily && (
              <div className="grid grid-cols-4 gap-2 pt-2 text-center text-xs">
                <Stat label="开" value={daily.o} />
                <Stat label="高" value={daily.h} />
                <Stat label="低" value={daily.l} />
                <Stat label="量" value={daily.v} raw />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  raw,
}: {
  label: string;
  value: number;
  raw?: boolean;
}) {
  return (
    <div className="bg-muted rounded-md py-1.5">
      <div className="text-muted-foreground">{label}</div>
      <div className="font-mono">
        {raw ? value.toLocaleString() : value.toFixed(2)}
      </div>
    </div>
  );
}

function ScreenerCard() {
  const [rows, setRows] = useState<FinvizScreenerItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadScreener = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await finvizScreener({ order_by: "ticker" });
      setRows(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Finviz 筛选</CardTitle>
        <CardDescription>默认按 Ticker 排序的前 20 条</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button onClick={loadScreener} disabled={loading} className="w-fit">
          {loading ? <RefreshCw className="animate-spin" /> : <RefreshCw />}
          加载筛选结果
        </Button>

        {loading && <Skeleton className="h-48 w-full" />}

        {!loading && error && (
          <p className="text-destructive text-sm">{error}</p>
        )}

        {!loading && rows.length > 0 && (
          <div className="max-h-96 overflow-y-auto rounded-md border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted sticky top-0 text-xs">
                <tr>
                  <th className="px-3 py-2 font-medium">Ticker</th>
                  <th className="px-3 py-2 font-medium">公司</th>
                  <th className="px-3 py-2 font-medium">板块</th>
                  <th className="px-3 py-2 text-right font-medium">价格</th>
                  <th className="px-3 py-2 text-right font-medium">涨跌</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={`${row.Ticker}-${row["No."]}`} className="border-t">
                    <td className="px-3 py-2 font-medium">{row.Ticker}</td>
                    <td className="text-muted-foreground max-w-[160px] truncate px-3 py-2">
                      {row.Company}
                    </td>
                    <td className="text-muted-foreground px-3 py-2">
                      {row.Sector}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {row.Price != null ? row.Price.toFixed(2) : "—"}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {row.Change ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function NewsCard() {
  const [items, setItems] = useState<FinvizNewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await finvizNews({ Market: { ordered: "Time" } });
      setItems(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Finviz 市场新闻</CardTitle>
        <CardDescription>按时间排序的最新市场动态</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button onClick={loadNews} disabled={loading} className="w-fit">
          {loading ? <RefreshCw className="animate-spin" /> : <RefreshCw />}
          加载新闻
        </Button>

        {loading && (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}

        {!loading && error && (
          <p className="text-destructive text-sm">{error}</p>
        )}

        {!loading && items.length > 0 && (
          <ul className="flex flex-col divide-y rounded-md border">
            {items.map((item, i) => (
              <li key={`${item.Title}-${i}`} className="flex items-center gap-3 px-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <a
                    href={item.Url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-primary truncate text-sm font-medium hover:underline"
                  >
                    {item.Title}
                  </a>
                  <div className="text-muted-foreground flex gap-2 text-xs">
                    <span>{item.Source}</span>
                    <span>{item.Date}</span>
                    {item.Ticker && (
                      <Badge variant="outline">{item.Ticker}</Badge>
                    )}
                  </div>
                </div>
                <a href={item.Url} target="_blank" rel="noreferrer">
                  <ExternalLink className="text-muted-foreground size-4" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
