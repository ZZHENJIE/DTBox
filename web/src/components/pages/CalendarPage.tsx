import { useState, type FormEvent, type ReactNode } from "react";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/ui/tabs";

function today(offset = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const selectClass =
  "border-input bg-transparent dark:bg-input/30 h-9 w-full rounded-md border px-3 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none";

type Status<T> = {
  loading: boolean;
  error: string | null;
  data: T[];
};

export default function CalendarPage() {
  const [dateFrom, setDateFrom] = useState(today());
  const [dateTo, setDateTo] = useState(today(30));
  const [pageSize, setPageSize] = useState(20);
  const [ipoType, setIpoType] = useState<IPOType>("OrdinaryShares");

  const [ipo, setIpo] = useState<Status<IPOItem>>({
    loading: false,
    error: null,
    data: [],
  });
  const [economics, setEconomics] = useState<Status<EconomicsItem>>({
    loading: false,
    error: null,
    data: [],
  });
  const [earnings, setEarnings] = useState<Status<EarningsItem>>({
    loading: false,
    error: null,
    data: [],
  });

  const loadIpo = async () => {
    setIpo({ loading: true, error: null, data: [] });
    try {
      const res = await benzingaIpo({
        page_size: pageSize,
        date_from: dateFrom,
        date_to: dateTo,
        ipo_type: ipoType,
      });
      setIpo({ loading: false, error: null, data: res });
    } catch (err) {
      setIpo({
        loading: false,
        error: err instanceof Error ? err.message : String(err),
        data: [],
      });
    }
  };

  const loadEconomics = async () => {
    setEconomics({ loading: true, error: null, data: [] });
    try {
      const res = await benzingaEconomics({
        page_size: pageSize,
        date_from: dateFrom,
        date_to: dateTo,
      });
      setEconomics({ loading: false, error: null, data: res });
    } catch (err) {
      setEconomics({
        loading: false,
        error: err instanceof Error ? err.message : String(err),
        data: [],
      });
    }
  };

  const loadEarnings = async () => {
    setEarnings({ loading: true, error: null, data: [] });
    try {
      const res = await benzingaEarnings({
        page_size: pageSize,
        date_from: dateFrom,
        date_to: dateTo,
      });
      setEarnings({ loading: false, error: null, data: res });
    } catch (err) {
      setEarnings({
        loading: false,
        error: err instanceof Error ? err.message : String(err),
        data: [],
      });
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">财经日历</h1>
        <p className="text-muted-foreground text-sm">Benzinga 日历数据</p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <form
            onSubmit={onSubmit}
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
            <div className="flex w-40 flex-col gap-2">
              <Label htmlFor="cal-ipo-type">IPO 类型</Label>
              <select
                id="cal-ipo-type"
                className={selectClass}
                value={ipoType}
                onChange={(e) => setIpoType(e.target.value as IPOType)}
              >
                <option value="OrdinaryShares">普通股</option>
                <option value="SPAC">SPAC</option>
              </select>
            </div>
          </form>

          <Tabs defaultValue="ipo">
            <TabsList>
              <TabsTrigger value="ipo">IPO</TabsTrigger>
              <TabsTrigger value="economics">经济</TabsTrigger>
              <TabsTrigger value="earnings">财报</TabsTrigger>
            </TabsList>

            <TabsContent value="ipo" className="mt-4">
              <Button onClick={() => void loadIpo()} disabled={ipo.loading}>
                {ipo.loading ? (
                  <RefreshCw className="animate-spin" />
                ) : (
                  <RefreshCw />
                )}
                加载 IPO
              </Button>
              <CalendarTable status={ipo}>
                {ipo.data.length > 0 && (
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
                )}
              </CalendarTable>
            </TabsContent>

            <TabsContent value="economics" className="mt-4">
              <Button
                onClick={() => void loadEconomics()}
                disabled={economics.loading}
              >
                {economics.loading ? (
                  <RefreshCw className="animate-spin" />
                ) : (
                  <RefreshCw />
                )}
                加载经济事件
              </Button>
              <CalendarTable status={economics}>
                {economics.data.length > 0 && (
                  <tbody>
                    {economics.data.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="px-3 py-2">{item.date}</td>
                        <td className="px-3 py-2">{item.time}</td>
                        <td className="px-3 py-2 font-medium">
                          {item.event_name}
                        </td>
                        <td className="px-3 py-2">{item.country}</td>
                        <td className="px-3 py-2">{item.importance}</td>
                        <td className="px-3 py-2">{item.consensus}</td>
                        <td className="px-3 py-2">{item.actual}</td>
                      </tr>
                    ))}
                  </tbody>
                )}
              </CalendarTable>
            </TabsContent>

            <TabsContent value="earnings" className="mt-4">
              <Button
                onClick={() => void loadEarnings()}
                disabled={earnings.loading}
              >
                {earnings.loading ? (
                  <RefreshCw className="animate-spin" />
                ) : (
                  <RefreshCw />
                )}
                加载财报
              </Button>
              <CalendarTable status={earnings}>
                {earnings.data.length > 0 && (
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
                )}
              </CalendarTable>
            </TabsContent>
          </Tabs>
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
    return (
      <p className="text-destructive mt-4 text-sm">{status.error}</p>
    );
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
