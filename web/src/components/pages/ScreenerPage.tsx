import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ChevronLeft,
  ChevronRight,
  LineChart,
  SlidersHorizontal,
} from "lucide-react";

import { useAuth } from "~/hooks/use-auth";
import { finvizScreener } from "~/lib/endpoints";
import { parseSettings } from "~/lib/settings";
import { cn } from "~/lib/utils";
import type { FinvizScreenerItem } from "~/types/data";
import { KlineChart } from "~/components/charts/KlineChart";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Skeleton } from "~/components/ui/skeleton";

const selectClass =
  "border-input bg-transparent dark:bg-input/30 h-9 w-full rounded-md border px-3 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none";

const PAGE_SIZES = [10, 20, 50, 100];

function fmt(value: number | null | undefined): string {
  return value != null ? value.toLocaleString() : "—";
}

function fmtVolume(value: number | null | undefined): string {
  if (value == null) return "—";
  return `${(value / 1_000_000).toFixed(2)}M`;
}

function fmtMarketCap(value: number | null | undefined): string {
  return value != null ? `${value.toLocaleString()}M` : "—";
}

function changeColor(value: string | null): string {
  if (!value) return "";
  const v = value.trim();
  if (v.startsWith("-")) return "text-red-400";
  if (v.startsWith("+")) return "text-emerald-400";
  const num = Number.parseFloat(v);
  if (Number.isNaN(num)) return "";
  if (num < 0) return "text-red-400";
  if (num > 0) return "text-emerald-400";
  return "";
}

export default function ScreenerPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const settings = parseSettings(user?.settings);
  const presets = settings.screener_presets;

  const [open, setOpen] = useState(false);
  const [selectedName, setSelectedName] = useState("");
  const [activeName, setActiveName] = useState("");
  const [rows, setRows] = useState<FinvizScreenerItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasRun, setHasRun] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [chartSymbol, setChartSymbol] = useState<string | null>(null);
  const [shownSymbol, setShownSymbol] = useState("");

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);

  const openDialog = () => {
    setSelectedName(presets[0]?.name ?? "");
    setOpen(true);
  };

  const openChart = (symbol: string) => {
    setShownSymbol(symbol);
    setChartSymbol(symbol);
  };

  const currentIndex = pageRows.findIndex((r) => r.Ticker === shownSymbol);

  const goPrev = () => {
    if (currentIndex > 0) openChart(pageRows[currentIndex - 1].Ticker);
  };

  const goNext = () => {
    if (currentIndex >= 0 && currentIndex < pageRows.length - 1) {
      openChart(pageRows[currentIndex + 1].Ticker);
    }
  };

  const goQuote = () => {
    if (shownSymbol) {
      navigate(`/quote?symbol=${encodeURIComponent(shownSymbol)}`);
    }
  };

  const run = async () => {
    const preset = presets.find((p) => p.name === selectedName);
    if (!preset) return;

    setOpen(false);
    setActiveName(preset.name);
    setHasRun(true);
    setLoading(true);
    setError(null);
    setPage(1);
    try {
      const res = await finvizScreener({
        order_by: preset.order_by,
        signal: preset.signal || null,
        parameter: preset.parameter || null,
      });
      setRows(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100dvh-7rem)] flex-col gap-6">

      {loading && <Skeleton className="min-h-0 w-full flex-1" />}

      {!loading && error && (
        <p className="text-destructive text-sm">{error}</p>
      )}

      {!loading && !error && hasRun && (
        <Card className="min-h-0 flex-1">
          <CardHeader>
            <CardTitle>{activeName}</CardTitle>
            <CardDescription>
              {t("screener.resultCount", { count: rows.length })}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col gap-4">
            {rows.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                {t("screener.noResults")}
              </p>
            ) : (
              <>
                <div className="min-h-0 flex-1 overflow-auto rounded-md border">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-muted sticky top-0 text-xs">
                      <tr>
                        <th className="px-3 py-2 font-medium">
                          {t("screener.symbol")}
                        </th>
                        <th className="px-3 py-2 font-medium">
                          {t("screener.company")}
                        </th>
                        <th className="px-3 py-2 font-medium">
                          {t("screener.sector")}
                        </th>
                        <th className="px-3 py-2 font-medium">
                          {t("screener.industry")}
                        </th>
                        <th className="px-3 py-2 font-medium">
                          {t("screener.country")}
                        </th>
                        <th className="px-3 py-2 text-right font-medium">
                          {t("screener.marketCap")}
                        </th>
                        <th className="px-3 py-2 text-right font-medium">
                          {t("screener.pe")}
                        </th>
                        <th className="px-3 py-2 text-right font-medium">
                          {t("screener.price")}
                        </th>
                        <th className="px-3 py-2 text-right font-medium">
                          {t("screener.change")}
                        </th>
                        <th className="px-3 py-2 text-right font-medium">
                          {t("screener.volume")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageRows.map((row) => (
                        <tr
                          key={`${row.Ticker}-${row["No."]}`}
                          className="border-t"
                        >
                          <td className="px-3 py-2">
                            <button
                              type="button"
                              className="font-medium text-primary hover:underline"
                              onClick={() => openChart(row.Ticker)}
                            >
                              {row.Ticker}
                            </button>
                          </td>
                          <td className="text-muted-foreground max-w-[200px] truncate px-3 py-2">
                            {row.Company}
                          </td>
                          <td className="px-3 py-2">{row.Sector}</td>
                          <td className="px-3 py-2">{row.Industry}</td>
                          <td className="px-3 py-2">{row.Country}</td>
                          <td className="px-3 py-2 text-right font-mono">
                            {fmtMarketCap(row["Market Cap"])}
                          </td>
                          <td className="px-3 py-2 text-right font-mono">
                            {fmt(row["P/E"])}
                          </td>
                          <td className="px-3 py-2 text-right font-mono">
                            {fmt(row.Price)}
                          </td>
                          <td
                            className={cn(
                              "px-3 py-2 text-right font-mono",
                              changeColor(row.Change),
                            )}
                          >
                            {row.Change ?? "—"}
                          </td>
                          <td className="px-3 py-2 text-right font-mono">
                            {fmtVolume(row.Volume)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">
                      {t("screener.pageInfo", { page, total: totalPages })}
                    </span>
                    <select
                      className={cn(selectClass, "h-8 w-20")}
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setPage(1);
                      }}
                    >
                      {PAGE_SIZES.map((size) => (
                        <option key={size} value={size}>
                          {t("screener.perPage", { size })}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                    >
                      <ChevronLeft />
                      {t("common.prevPage")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      {t("common.nextPage")}
                      <ChevronRight />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      <Button
        size="icon"
        aria-label={t("screener.filter")}
        className="fixed right-8 top-22 size-12 rounded-full shadow-lg"
        onClick={openDialog}
      >
        <SlidersHorizontal className="size-5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("screener.selectScreener")}</DialogTitle>
            <DialogDescription>{t("screener.selectScreenerDesc")}</DialogDescription>
          </DialogHeader>

          {presets.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {t("screener.noPresets")}
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              <Label htmlFor="screener-preset">{t("screener.screener")}</Label>
              <select
                id="screener-preset"
                className={selectClass}
                value={selectedName}
                onChange={(e) => setSelectedName(e.target.value)}
              >
                {presets.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button onClick={() => void run()} disabled={presets.length === 0}>
              {t("common.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={chartSymbol != null}
        onOpenChange={(o) => {
          if (!o) setChartSymbol(null);
        }}
      >
        <DialogContent
          forceMount
          className="data-[state=closed]:invisible sm:max-w-[85vw]"
        >
          <DialogHeader>
            <DialogTitle>{shownSymbol || t("screener.kline")}</DialogTitle>
            <DialogDescription>
              {currentIndex >= 0
                ? pageRows[currentIndex].Company
                : t("screener.klineFallback")}
            </DialogDescription>
          </DialogHeader>
          {shownSymbol && (
            <KlineChart
              symbol={shownSymbol}
              interval={settings.chart_interval}
              range={settings.chart_range}
              className="h-[70vh] w-full rounded-md border"
            />
          )}

          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentIndex <= 0}
                onClick={goPrev}
              >
                <ChevronLeft />
                {t("screener.prevItem")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentIndex < 0 || currentIndex >= pageRows.length - 1}
                onClick={goNext}
              >
                {t("screener.nextItem")}
                <ChevronRight />
              </Button>
            </div>
            <span className="text-muted-foreground text-xs">
              {currentIndex >= 0 ? currentIndex + 1 : 0} / {pageRows.length}
            </span>
            <Button size="sm" onClick={goQuote}>
              <LineChart />
              {t("screener.quote")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
