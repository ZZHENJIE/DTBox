import { useEffect, useState, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import { RefreshCw } from "lucide-react";

import {
  benzingaEarnings,
  benzingaEconomics,
  benzingaIpo,
} from "~/lib/endpoints";
import type {
  EarningsItem,
  EconomicsItem,
  IPOItem,
  IPOType,
} from "~/types/data";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Skeleton } from "~/components/ui/skeleton";

const VALID_TYPES = ["ipo", "spac", "economics", "earnings"] as const;
type CalendarKind = (typeof VALID_TYPES)[number];

const TITLES: Record<CalendarKind, string> = {
  ipo: "IPO 日历",
  spac: "SPAC 日历",
  economics: "经济日历",
  earnings: "财报日历",
};

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
  const raw = useParams().type ?? "ipo";
  const type: CalendarKind = (VALID_TYPES as readonly string[]).includes(raw)
    ? (raw as CalendarKind)
    : "ipo";

  const isIpo = type === "ipo" || type === "spac";

  const [dateFrom, setDateFrom] = useState(isIpo ? monthStart() : today());
  const [dateTo, setDateTo] = useState(isIpo ? monthEnd() : today());
  const [pageSize, setPageSize] = useState(20);

  const [ipo, setIpo] = useState<Status<IPOItem>>({
    loading: isIpo,
    error: null,
    data: [],
  });
  const [economics, setEconomics] = useState<Status<EconomicsItem>>({
    loading: type === "economics",
    error: null,
    data: [],
  });
  const [earnings, setEarnings] = useState<Status<EarningsItem>>({
    loading: type === "earnings",
    error: null,
    data: [],
  });

  const fetchIpo = (ipoType: IPOType) =>
    benzingaIpo({
      page_size: pageSize,
      date_from: dateFrom,
      date_to: dateTo,
      ipo_type: ipoType,
    });

  const fetchEconomics = () =>
    benzingaEconomics({
      page_size: pageSize,
      date_from: dateFrom,
      date_to: dateTo,
    });

  const fetchEarnings = () =>
    benzingaEarnings({
      page_size: pageSize,
      date_from: dateFrom,
      date_to: dateTo,
    });

  const loadIpo = async (ipoType: IPOType) => {
    setIpo({ loading: true, error: null, data: [] });
    await settle(fetchIpo(ipoType), setIpo);
  };

  const loadEconomics = async () => {
    setEconomics({ loading: true, error: null, data: [] });
    await settle(fetchEconomics(), setEconomics);
  };

  const loadEarnings = async () => {
    setEarnings({ loading: true, error: null, data: [] });
    await settle(fetchEarnings(), setEarnings);
  };

  useEffect(() => {
    if (type === "ipo" || type === "spac") {
      void settle(fetchIpo(type === "spac" ? "SPAC" : "OrdinaryShares"), setIpo);
    } else if (type === "economics") {
      void settle(fetchEconomics(), setEconomics);
    } else {
      void settle(fetchEarnings(), setEarnings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    type === "ipo" || type === "spac"
      ? ipo.loading
      : type === "economics"
        ? economics.loading
        : earnings.loading;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{TITLES[type]}</h1>
        <p className="text-muted-foreground text-sm">Benzinga 日历数据</p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              load();
            }}
            className="flex flex-wrap items-end gap-3"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="cal-from">开始日期</Label>
              <Input
                id="cal-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="cal-to">结束日期</Label>
              <Input
                id="cal-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="flex w-28 flex-col gap-2">
              <Label htmlFor="cal-size">每页数量</Label>
              <Input
                id="cal-size"
                type="number"
                min={1}
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value) || 20)}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <RefreshCw className="animate-spin" />
              ) : (
                <RefreshCw />
              )}
              加载
            </Button>
          </form>

          {(type === "ipo" || type === "spac") && (
            <CalendarTable status={ipo}>
              <tbody>
                {ipo.data.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-3 py-2 font-medium">{item.ticker}</td>
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

          {type === "economics" && (
            <CalendarTable status={economics}>
              <tbody>
                {economics.data.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-3 py-2">{item.date}</td>
                    <td className="px-3 py-2">{item.time}</td>
                    <td className="px-3 py-2 font-medium">{item.event_name}</td>
                    <td className="px-3 py-2">{item.country}</td>
                    <td className="px-3 py-2">{item.importance}</td>
                    <td className="px-3 py-2">{item.consensus}</td>
                    <td className="px-3 py-2">{item.actual}</td>
                  </tr>
                ))}
              </tbody>
            </CalendarTable>
          )}

          {type === "earnings" && (
            <CalendarTable status={earnings}>
              <tbody>
                {earnings.data.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-3 py-2 font-medium">{item.ticker}</td>
                    <td className="text-muted-foreground max-w-[220px] truncate px-3 py-2">
                      {item.name}
                    </td>
                    <td className="px-3 py-2">{item.date}</td>
                    <td className="px-3 py-2">{item.eps}</td>
                    <td className="px-3 py-2">{item.eps_est}</td>
                    <td className="px-3 py-2">{item.revenue}</td>
                  </tr>
                ))}
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
  children,
}: {
  status: Status<T>;
  children: ReactNode;
}) {
  if (status.loading) {
    return <Skeleton className="mt-4 h-48 w-full" />;
  }

  if (status.error) {
    return <p className="text-destructive mt-4 text-sm">{status.error}</p>;
  }

  if (status.data.length === 0) {
    return <p className="text-muted-foreground mt-4 text-sm">暂无数据</p>;
  }

  return (
    <div className="mt-4 max-h-[32rem] overflow-y-auto rounded-md border">
      <table className="w-full text-left text-sm">{children}</table>
    </div>
  );
}
