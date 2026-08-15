import { useState } from "react";
import { Plus } from "lucide-react";

import { useAuth } from "~/hooks/use-auth";
import { finvizScreener } from "~/lib/endpoints";
import { readScreenerPresets } from "~/lib/finviz";
import type { FinvizScreenerItem } from "~/types/data";
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

function fmt(value: number | null | undefined): string {
  return value != null ? value.toLocaleString() : "—";
}

export default function ScreenerPage() {
  const { user } = useAuth();
  const presets = readScreenerPresets(user?.settings);

  const [open, setOpen] = useState(false);
  const [selectedName, setSelectedName] = useState("");
  const [activeName, setActiveName] = useState("");
  const [rows, setRows] = useState<FinvizScreenerItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasRun, setHasRun] = useState(false);

  const openDialog = () => {
    setSelectedName(presets[0]?.name ?? "");
    setOpen(true);
  };

  const run = async () => {
    const preset = presets.find((p) => p.name === selectedName);
    if (!preset) return;

    setOpen(false);
    setActiveName(preset.name);
    setHasRun(true);
    setLoading(true);
    setError(null);
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
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">筛选</h1>
        <p className="text-muted-foreground text-sm">股票筛选器</p>
      </div>

      {loading && <Skeleton className="h-64 w-full" />}

      {!loading && error && (
        <p className="text-destructive text-sm">{error}</p>
      )}

      {!loading && !error && hasRun && (
        <Card>
          <CardHeader>
            <CardTitle>{activeName}</CardTitle>
            <CardDescription>共 {rows.length} 条结果</CardDescription>
          </CardHeader>
          <CardContent>
            {rows.length === 0 ? (
              <p className="text-muted-foreground text-sm">无匹配结果</p>
            ) : (
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted sticky top-0 text-xs">
                    <tr>
                      <th className="px-3 py-2 font-medium">Ticker</th>
                      <th className="px-3 py-2 font-medium">公司</th>
                      <th className="px-3 py-2 font-medium">板块</th>
                      <th className="px-3 py-2 font-medium">行业</th>
                      <th className="px-3 py-2 font-medium">国家</th>
                      <th className="px-3 py-2 text-right font-medium">市值</th>
                      <th className="px-3 py-2 text-right font-medium">P/E</th>
                      <th className="px-3 py-2 text-right font-medium">价格</th>
                      <th className="px-3 py-2 text-right font-medium">涨跌</th>
                      <th className="px-3 py-2 text-right font-medium">成交量</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={`${row.Ticker}-${row["No."]}`} className="border-t">
                        <td className="px-3 py-2 font-medium">{row.Ticker}</td>
                        <td className="text-muted-foreground max-w-[200px] truncate px-3 py-2">
                          {row.Company}
                        </td>
                        <td className="px-3 py-2">{row.Sector}</td>
                        <td className="px-3 py-2">{row.Industry}</td>
                        <td className="px-3 py-2">{row.Country}</td>
                        <td className="px-3 py-2 text-right font-mono">
                          {fmt(row["Market Cap"])}
                        </td>
                        <td className="px-3 py-2 text-right font-mono">
                          {fmt(row["P/E"])}
                        </td>
                        <td className="px-3 py-2 text-right font-mono">
                          {fmt(row.Price)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono">
                          {row.Change ?? "—"}
                        </td>
                        <td className="px-3 py-2 text-right font-mono">
                          {fmt(row.Volume)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Button
        size="icon"
        aria-label="新建筛选"
        className="fixed right-6 bottom-6 size-12 rounded-full shadow-lg"
        onClick={openDialog}
      >
        <Plus className="size-5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>选择筛选器</DialogTitle>
            <DialogDescription>选择要使用的筛选预设</DialogDescription>
          </DialogHeader>

          {presets.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              暂无筛选器预设，请先在设置中添加
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              <Label htmlFor="screener-preset">筛选器</Label>
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
              取消
            </Button>
            <Button onClick={() => void run()} disabled={presets.length === 0}>
              确定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
