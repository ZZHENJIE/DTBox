import { useState, type FormEvent } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { useAuth } from "~/hooks/use-auth";
import { updateProfile } from "~/lib/endpoints";
import {
  INTERVALS,
  RANGES,
  readChartDefaults,
  readScreenerPresets,
  type ScreenerPreset,
} from "~/lib/finviz";
import type { FinvizInterval, FinvizValidRange } from "~/types/data";
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
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Skeleton } from "~/components/ui/skeleton";

const selectClass =
  "border-input bg-transparent dark:bg-input/30 h-9 w-full rounded-md border px-3 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none";

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">设置</h1>
        <p className="text-muted-foreground text-sm">软件的个人设置</p>
      </div>

      {user ? (
        <>
          <ChartSettingsForm settings={user.settings} onSaved={refreshUser} />
          <ScreenerSettings settings={user.settings} onSaved={refreshUser} />
        </>
      ) : (
        <Card>
          <CardContent className="py-8">
            <Skeleton className="h-9 w-64" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ChartSettingsForm({
  settings,
  onSaved,
}: {
  settings: Record<string, unknown>;
  onSaved: () => Promise<void>;
}) {
  const defaults = readChartDefaults(settings);

  const [interval, setInterval] = useState<FinvizInterval>(defaults.interval);
  const [range, setRange] = useState<FinvizValidRange>(defaults.range);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      await updateProfile({
        settings: {
          ...settings,
          chart_interval: interval,
          chart_range: range,
        },
      });
      await onSaved();
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>默认图表</CardTitle>
        <CardDescription>报价页默认使用的周期与范围</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex w-40 flex-col gap-2">
            <Label htmlFor="settings-interval">默认周期</Label>
            <select
              id="settings-interval"
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

          <div className="flex w-40 flex-col gap-2">
            <Label htmlFor="settings-range">默认范围</Label>
            <select
              id="settings-range"
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

          <Button onClick={() => void save()} disabled={busy}>
            {busy ? "保存中…" : "保存"}
          </Button>
        </div>

        {error && (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        )}
        {saved && <p className="text-emerald-400 text-sm">已保存</p>}
      </CardContent>
    </Card>
  );
}

function ScreenerSettings({
  settings,
  onSaved,
}: {
  settings: Record<string, unknown>;
  onSaved: () => Promise<void>;
}) {
  const [presets, setPresets] = useState<ScreenerPreset[]>(() =>
    readScreenerPresets(settings),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ScreenerPreset | null>(null);

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (preset: ScreenerPreset) => {
    setEditing(preset);
    setDialogOpen(true);
  };

  const handleSubmit = (preset: ScreenerPreset) => {
    if (editing) {
      setPresets((prev) =>
        prev.map((p) => (p === editing ? preset : p)),
      );
    } else {
      setPresets((prev) => [...prev, preset]);
    }
  };

  const remove = (preset: ScreenerPreset) => {
    setPresets((prev) => prev.filter((p) => p !== preset));
  };

  const save = async () => {
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      await updateProfile({
        settings: {
          ...settings,
          screener_presets: presets,
        },
      });
      await onSaved();
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>筛选器</CardTitle>
        <CardDescription>保存的股票筛选条件预设</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {presets.length === 0 ? (
          <p className="text-muted-foreground text-sm">暂无筛选器预设</p>
        ) : (
          <ul className="flex flex-col divide-y rounded-md border">
            {presets.map((preset) => (
              <li
                key={preset.name}
                className="flex items-center gap-2 px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    {preset.name}
                  </div>
                  <div className="text-muted-foreground truncate text-xs">
                    {preset.order_by}
                    {preset.signal && ` · ${preset.signal}`}
                    {preset.parameter && ` · ${preset.parameter}`}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(preset)}
                  title="编辑"
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(preset)}
                  title="删除"
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={openAdd}>
            <Plus />
            添加预设
          </Button>
          <Button onClick={() => void save()} disabled={busy}>
            {busy ? "保存中…" : "保存"}
          </Button>
        </div>

        {error && (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        )}
        {saved && <p className="text-emerald-400 text-sm">已保存</p>}
      </CardContent>

      <ScreenerPresetDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSubmit={handleSubmit}
      />
    </Card>
  );
}

function ScreenerPresetDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: ScreenerPreset | null;
  onSubmit: (preset: ScreenerPreset) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "编辑预设" : "添加预设"}</DialogTitle>
          <DialogDescription>设置筛选器的排序与过滤参数</DialogDescription>
        </DialogHeader>
        <ScreenerPresetForm
          initial={initial}
          onSubmit={onSubmit}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function ScreenerPresetForm({
  initial,
  onSubmit,
  onClose,
}: {
  initial: ScreenerPreset | null;
  onSubmit: (preset: ScreenerPreset) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [orderBy, setOrderBy] = useState(initial?.order_by ?? "");
  const [signal, setSignal] = useState(initial?.signal ?? "");
  const [parameter, setParameter] = useState(initial?.parameter ?? "");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !orderBy.trim()) {
      setError("名称与排序字段不能为空");
      return;
    }
    onSubmit({
      name: name.trim(),
      order_by: orderBy.trim(),
      signal: signal.trim(),
      parameter: parameter.trim(),
    });
    onClose();
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="preset-name">名称</Label>
        <Input
          id="preset-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="如：高增长科技股"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="preset-order">排序字段</Label>
        <Input
          id="preset-order"
          value={orderBy}
          onChange={(e) => setOrderBy(e.target.value)}
          placeholder="ticker"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="preset-signal">信号（可选）</Label>
        <Input
          id="preset-signal"
          value={signal}
          onChange={(e) => setSignal(e.target.value)}
          placeholder="如：ta_topgainers"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="preset-parameter">过滤参数（可选）</Label>
        <Input
          id="preset-parameter"
          value={parameter}
          onChange={(e) => setParameter(e.target.value)}
          placeholder="如：exch_nasd"
        />
      </div>

      {error && (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          取消
        </Button>
        <Button type="submit">确定</Button>
      </DialogFooter>
    </form>
  );
}
