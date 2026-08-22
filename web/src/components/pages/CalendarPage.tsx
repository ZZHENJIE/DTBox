import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RefreshCw } from "lucide-react";

import {
  benzingaEarnings,
  benzingaEconomics,
  benzingaIpo,
  finvizEarnings,
  finvizEconomics,
} from "~/lib/endpoints";
import type {
  BenzingaEarningsItem,
  BenzingaEconomicsItem,
  FinvizEarningsItem,
  FinvizEconomicsItem,
  IPOItem,
  IPOType,
} from "~/types/data";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Skeleton } from "~/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";

const VALID_TYPES = ["ipo", "spac", "economics", "earnings"] as const;
type CalendarKind = (typeof VALID_TYPES)[number];
type CalendarSource = "finviz" | "benzinga";

const PAGE_SIZE = 1000;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function monthStart(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`;
}

function monthEnd(): string {
  const d = new Date();
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return `${last.getFullYear()}-${pad(last.getMonth() + 1)}-${pad(last.getDate())}`;
}

function formatDateFromTimestamp(ts: number): string {
  if (!ts) return "—";
  const d = new Date(ts * 1000);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatTimeFromTimestamp(ts: number): string {
  if (!ts) return "—";
  const d = new Date(ts * 1000);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatTimestampFallback(
  timestamp: number | undefined,
  legacyDate?: string,
  legacyTime?: string,
): { date: string; time: string } {
  if (timestamp) {
    return {
      date: formatDateFromTimestamp(timestamp),
      time: formatTimeFromTimestamp(timestamp),
    };
  }
  return {
    date: legacyDate || "—",
    time: legacyTime || "—",
  };
}

function fmtNum(v: number | null | undefined): string {
  if (v == null) return "—";
  return Number(v).toLocaleString();
}

function fmtStr(v: string | null | undefined): string {
  if (v == null || v === "") return "—";
  return v;
}

type Status<T> = {
  loading: boolean;
  error: string | null;
  data: T[];
};

function settle<T>(
  promise: Promise<T[]>,
  setStatus: (status: Status<T>) => void,
): Promise<void> {
  return promise
    .then((data) => setStatus({ loading: false, error: null, data }))
    .catch((err) =>
      setStatus({
        loading: false,
        error: err instanceof Error ? err.message : String(err),
        data: [],
      }),
    );
}

export default function CalendarPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const raw = useParams().type ?? "ipo";
  const type: CalendarKind = (VALID_TYPES as readonly string[]).includes(raw)
    ? (raw as CalendarKind)
    : "ipo";

  const isIpo = type === "ipo" || type === "spac";
  const isEconomics = type === "economics";
  const isEarnings = type === "earnings";

  const goQuote = (symbol: string) => {
    if (!symbol || symbol === "—") return;
    navigate(`/quote?symbol=${encodeURIComponent(symbol)}`);
  };

  const [dateFrom, setDateFrom] = useState(isIpo ? monthStart() : today());
  const [dateTo, setDateTo] = useState(isIpo ? monthEnd() : today());

  // default source is finviz for economics/earnings
  const [source, setSource] = useState<CalendarSource>("finviz");

  const [ipo, setIpo] = useState<Status<IPOItem>>({
    loading: isIpo,
    error: null,
    data: [],
  });

  const [economicsBz, setEconomicsBz] = useState<Status<BenzingaEconomicsItem>>({
    loading: false,
    error: null,
    data: [],
  });
  const [economicsFv, setEconomicsFv] = useState<Status<FinvizEconomicsItem>>({
    loading: isEconomics,
    error: null,
    data: [],
  });

  const [earningsBz, setEarningsBz] = useState<Status<BenzingaEarningsItem>>({
    loading: false,
    error: null,
    data: [],
  });
  const [earningsFv, setEarningsFv] = useState<Status<FinvizEarningsItem>>({
    loading: isEarnings,
    error: null,
    data: [],
  });

  const fetchIpo = (ipoType: IPOType) =>
    benzingaIpo({
      page_size: PAGE_SIZE,
      date_from: dateFrom,
      date_to: dateTo,
      ipo_type: ipoType,
    });

  const fetchEconomicsBz = () =>
    benzingaEconomics({
      page_size: PAGE_SIZE,
      date_from: dateFrom,
      date_to: dateTo,
    });

  const fetchEconomicsFv = () =>
    finvizEconomics({
      date_from: dateFrom,
      date_to: dateTo,
    });

  const fetchEarningsBz = () =>
    benzingaEarnings({
      page_size: PAGE_SIZE,
      date_from: dateFrom,
      date_to: dateTo,
    });

  const fetchEarningsFv = () =>
    finvizEarnings({
      date_from: dateFrom,
      date_to: dateTo,
    });

  const loadIpo = async (ipoType: IPOType) => {
    setIpo({ loading: true, error: null, data: [] });
    await settle(fetchIpo(ipoType), setIpo);
  };

  const loadEconomics = async (src: CalendarSource = source) => {
    if (src === "finviz") {
      setEconomicsFv({ loading: true, error: null, data: [] });
      await settle(fetchEconomicsFv(), setEconomicsFv);
    } else {
      setEconomicsBz({ loading: true, error: null, data: [] });
      await settle(fetchEconomicsBz(), setEconomicsBz);
    }
  };

  const loadEarnings = async (src: CalendarSource = source) => {
    if (src === "finviz") {
      setEarningsFv({ loading: true, error: null, data: [] });
      await settle(fetchEarningsFv(), setEarningsFv);
    } else {
      setEarningsBz({ loading: true, error: null, data: [] });
      await settle(fetchEarningsBz(), setEarningsBz);
    }
  };

  useEffect(() => {
    if (type === "ipo" || type === "spac") {
      void settle(fetchIpo(type === "spac" ? "SPAC" : "OrdinaryShares"), setIpo);
    } else if (type === "economics") {
      // default finviz
      void settle(fetchEconomicsFv(), setEconomicsFv);
    } else {
      void settle(fetchEarningsFv(), setEarningsFv);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSourceChange = (next: string) => {
    const src = next as CalendarSource;
    setSource(src);
    if (type === "economics") {
      void loadEconomics(src);
    } else if (type === "earnings") {
      void loadEarnings(src);
    }
  };

  const load = () => {
    if (type === "ipo" || type === "spac") {
      void loadIpo(type === "spac" ? "SPAC" : "OrdinaryShares");
    } else if (type === "economics") {
      void loadEconomics();
    } else {
      void loadEarnings();
    }
  };

  const loading =
    isIpo
      ? ipo.loading
      : isEconomics
        ? source === "finviz"
          ? economicsFv.loading
          : economicsBz.loading
        : source === "finviz"
          ? earningsFv.loading
          : earningsBz.loading;

  const showSourceSwitch = isEconomics || isEarnings;

  return (
    <div className="flex h-[calc(100dvh-7rem)] flex-col gap-6">
      <Card className="min-h-0 flex-1">
        <CardContent className="flex min-h-0 flex-1 flex-col gap-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              load();
            }}
            className="flex flex-wrap items-end gap-3"
          >
            {showSourceSwitch && (
              <div className="flex flex-col gap-2">
                <Label>{t("calendar.dataSource")}</Label>
                <Tabs value={source} onValueChange={handleSourceChange}>
                  <TabsList>
                    <TabsTrigger value="finviz">{t("calendar.finviz")}</TabsTrigger>
                    <TabsTrigger value="benzinga">{t("calendar.benzinga")}</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="cal-from">{t("calendar.startDate")}</Label>
              <Input
                id="cal-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="cal-to">{t("calendar.endDate")}</Label>
              <Input
                id="cal-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? <RefreshCw className="animate-spin" /> : <RefreshCw />}
              {t("calendar.load")}
            </Button>
          </form>

          {(type === "ipo" || type === "spac") && (
            <CalendarTable
              status={ipo}
              headers={[
                t("calendar.code"),
                t("calendar.name"),
                t("calendar.date"),
                t("calendar.exchange"),
                t("calendar.type"),
              ]}
            >
              <tbody>
                {ipo.data.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        className="font-medium text-primary hover:underline"
                        onClick={() => goQuote(item.ticker)}
                      >
                        {item.ticker}
                      </button>
                    </td>
                    <td className="text-muted-foreground max-w-[220px] truncate px-3 py-2">
                      {item.name}
                    </td>
                    <td className="px-3 py-2">{item.date}</td>
                    <td className="px-3 py-2">{item.exchange}</td>
                    <td className="px-3 py-2">{item.ipo_type}</td>
                  </tr>
                ))}
              </tbody>
            </CalendarTable>
          )}

          {type === "economics" && source === "benzinga" && (
            <CalendarTable
              status={economicsBz}
              headers={[
                t("calendar.date"),
                t("calendar.time"),
                t("calendar.event"),
                t("calendar.country"),
                t("calendar.importance"),
                t("calendar.consensus"),
                t("calendar.actual"),
              ]}
            >
              <tbody>
                {economicsBz.data.map((item) => {
                  const { date, time } = formatTimestampFallback(
                    item.timestamp,
                    item.date,
                    item.time,
                  );
                  return (
                    <tr key={item.id} className="border-t">
                      <td className="px-3 py-2">{date}</td>
                      <td className="px-3 py-2">{time}</td>
                      <td className="px-3 py-2 font-medium">{fmtStr(item.event_name)}</td>
                      <td className="px-3 py-2">{fmtStr(item.country)}</td>
                      <td className="px-3 py-2">{item.importance ?? "—"}</td>
                      <td className="px-3 py-2">{fmtStr(item.consensus)}</td>
                      <td className="px-3 py-2">{fmtStr(item.actual)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </CalendarTable>
          )}

          {type === "economics" && source === "finviz" && (
            <CalendarTable
              status={economicsFv}
              headers={[
                t("calendar.date"),
                t("calendar.time"),
                t("calendar.event"),
                t("calendar.impact"),
                t("calendar.for"),
                t("calendar.actual"),
                t("calendar.expected"),
                t("calendar.prior"),
              ]}
            >
              <tbody>
                {economicsFv.data.map((item, idx) => {
                  const date = formatDateFromTimestamp(item.Timestamp);
                  const time = formatTimeFromTimestamp(item.Timestamp);
                  return (
                    <tr key={`${item.Event}-${item.Timestamp}-${idx}`} className="border-t">
                      <td className="px-3 py-2">{date}</td>
                      <td className="px-3 py-2">{time}</td>
                      <td className="px-3 py-2 font-medium">{fmtStr(item.Event)}</td>
                      <td className="px-3 py-2">{item.Impact ?? "—"}</td>
                      <td className="px-3 py-2">{fmtStr(item.For)}</td>
                      <td className="px-3 py-2">{fmtStr(item.Actual)}</td>
                      <td className="px-3 py-2">{fmtStr(item.Expected)}</td>
                      <td className="px-3 py-2">{fmtStr(item.Prior)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </CalendarTable>
          )}

          {type === "earnings" && source === "benzinga" && (
            <CalendarTable
              status={earningsBz}
              headers={[
                t("calendar.code"),
                t("calendar.name"),
                t("calendar.date"),
                t("calendar.time"),
                t("calendar.eps"),
                t("calendar.epsEst"),
                t("calendar.revenue"),
              ]}
            >
              <tbody>
                {earningsBz.data.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        className="font-medium text-primary hover:underline"
                        onClick={() => goQuote(item.ticker)}
                      >
                        {item.ticker}
                      </button>
                    </td>
                    <td className="text-muted-foreground max-w-[220px] truncate px-3 py-2">
                      {item.name}
                    </td>
                    <td className="px-3 py-2">{fmtStr(item.date)}</td>
                    <td className="px-3 py-2">{fmtStr(item.time)}</td>
                    <td className="px-3 py-2">{fmtStr(item.eps)}</td>
                    <td className="px-3 py-2">{fmtStr(item.eps_est)}</td>
                    <td className="px-3 py-2">{fmtStr(item.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </CalendarTable>
          )}

          {type === "earnings" && source === "finviz" && (
            <CalendarTable
              status={earningsFv}
              headers={[
                t("calendar.date"),
                t("calendar.time"),
                t("calendar.code"),
                t("calendar.name"),
                t("calendar.marketCap"),
                t("calendar.epsEst"),
                t("calendar.epsActual"),
                t("calendar.revenueEst"),
                t("calendar.revenueActual"),
              ]}
            >
              <tbody>
                {earningsFv.data.map((item, idx) => {
                  const date = formatDateFromTimestamp(item.Timestamp);
                  const time = formatTimeFromTimestamp(item.Timestamp);
                  return (
                    <tr key={`${item.Ticker}-${item.Timestamp}-${idx}`} className="border-t">
                      <td className="px-3 py-2">{date}</td>
                      <td className="px-3 py-2">{time}</td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          className="font-medium text-primary hover:underline"
                          onClick={() => goQuote(item.Ticker)}
                        >
                          {item.Ticker}
                        </button>
                      </td>
                      <td className="text-muted-foreground max-w-[220px] truncate px-3 py-2">
                        {item.Company}
                      </td>
                      <td className="px-3 py-2">{fmtNum(item["Market Cap"])}</td>
                      <td className="px-3 py-2">{fmtNum(item["EPS Estimate"])}</td>
                      <td className="px-3 py-2">{fmtNum(item["EPS Actual"])}</td>
                      <td className="px-3 py-2">{fmtNum(item["Revenue Estimate"])}</td>
                      <td className="px-3 py-2">{fmtNum(item["Revenue Actual"])}</td>
                    </tr>
                  );
                })}
              </tbody>
            </CalendarTable>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CalendarTable<T>({
  status,
  headers,
  children,
}: {
  status: Status<T>;
  headers: string[];
  children: ReactNode;
}) {
  const { t } = useTranslation();

  if (status.loading) {
    return <Skeleton className="min-h-0 w-full flex-1" />;
  }

  if (status.error) {
    return <p className="text-destructive text-sm">{status.error}</p>;
  }

  if (status.data.length === 0) {
    return <p className="text-muted-foreground text-sm">{t("calendar.noData")}</p>;
  }

  return (
    <div className="min-h-0 flex-1 overflow-auto rounded-md border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted sticky top-0 text-xs">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-3 py-2 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        {children}
      </table>
    </div>
  );
}
