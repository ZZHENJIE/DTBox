import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { useAuth } from "~/hooks/use-auth";
import { useToast } from "~/hooks/use-toast";
import { storeLocale, type Locale } from "~/i18n";
import { updateProfile } from "~/lib/endpoints";
import { INTERVALS, RANGES } from "~/lib/finviz";
import { parseSettings, type ScreenerPreset } from "~/lib/settings";
import type { FinvizInterval, FinvizValidRange } from "~/types/data";
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
import { ScreenerPresetDialog } from "~/components/screener/ScreenerPresetDialog";

const selectClass =
  "border-input bg-transparent dark:bg-input/30 h-9 w-full rounded-md border px-3 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none";

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("settings.title")}</h1>
        <p className="text-muted-foreground text-sm">{t("settings.subtitle")}</p>
      </div>

      {user ? (
        <>
          <LanguageSettingsForm settings={user.settings} onSaved={refreshUser} />
          <ChartSettingsForm settings={user.settings} onSaved={refreshUser} />
          <ScreenerSettings settings={user.settings} onSaved={refreshUser} />
          <TimeWindowSettingsForm
            settings={user.settings}
            onSaved={refreshUser}
          />
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

function LanguageSettingsForm({
  settings,
  onSaved,
}: {
  settings: Record<string, unknown>;
  onSaved: () => Promise<void>;
}) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const defaults = parseSettings(settings).language;

  const [language, setLanguage] = useState<Locale>(defaults);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      await updateProfile({
        settings: {
          ...settings,
          language,
        },
      });
      storeLocale(language);
      void i18n.changeLanguage(language);
      await onSaved();
      toast({ variant: "success", description: t("common.saved") });
    } catch (err) {
      toast({
        variant: "destructive",
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.language")}</CardTitle>
        <CardDescription>{t("settings.languageDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex w-40 flex-col gap-2">
            <Label htmlFor="settings-language">{t("settings.language")}</Label>
            <select
              id="settings-language"
              className={selectClass}
              value={language}
              onChange={(e) => setLanguage(e.target.value as Locale)}
            >
              <option value="en-US">{t("settings.english")}</option>
              <option value="zh-CN">{t("settings.chinese")}</option>
            </select>
          </div>

          <Button onClick={() => void save()} disabled={busy}>
            {busy ? t("common.saving") : t("common.save")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ChartSettingsForm({
  settings,
  onSaved,
}: {
  settings: Record<string, unknown>;
  onSaved: () => Promise<void>;
}) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const defaults = parseSettings(settings);

  const [interval, setInterval] = useState<FinvizInterval>(
    defaults.chart_interval,
  );
  const [range, setRange] = useState<FinvizValidRange>(defaults.chart_range);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      await updateProfile({
        settings: {
          ...settings,
          chart_interval: interval,
          chart_range: range,
        },
      });
      await onSaved();
      toast({ variant: "success", description: t("common.saved") });
    } catch (err) {
      toast({
        variant: "destructive",
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.defaultChart")}</CardTitle>
        <CardDescription>{t("settings.defaultChartDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex w-40 flex-col gap-2">
            <Label htmlFor="settings-interval">
              {t("settings.defaultInterval")}
            </Label>
            <select
              id="settings-interval"
              className={selectClass}
              value={interval}
              onChange={(e) => setInterval(e.target.value as FinvizInterval)}
            >
              {INTERVALS.map((it) => (
                <option key={it.value} value={it.value}>
                  {t(it.label)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex w-40 flex-col gap-2">
            <Label htmlFor="settings-range">{t("settings.defaultRange")}</Label>
            <select
              id="settings-range"
              className={selectClass}
              value={range}
              onChange={(e) => setRange(e.target.value as FinvizValidRange)}
            >
              {RANGES.map((r) => (
                <option key={r.value} value={r.value}>
                  {t(r.label)}
                </option>
              ))}
            </select>
          </div>

          <Button onClick={() => void save()} disabled={busy}>
            {busy ? t("common.saving") : t("common.save")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function TimeWindowSettingsForm({
  settings,
  onSaved,
}: {
  settings: Record<string, unknown>;
  onSaved: () => Promise<void>;
}) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const defaults = parseSettings(settings).time_window;

  const [textSize, setTextSize] = useState(String(defaults.text_size));
  const [textColor, setTextColor] = useState(defaults.text_color);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    const size = Number(textSize);
    if (!Number.isFinite(size) || size <= 0) {
      toast({
        variant: "destructive",
        description: t("settings.textSizeError"),
      });
      return;
    }

    setBusy(true);
    try {
      await updateProfile({
        settings: {
          ...settings,
          time_window: { text_size: size, text_color: textColor },
        },
      });
      await onSaved();
      toast({ variant: "success", description: t("common.saved") });
    } catch (err) {
      toast({
        variant: "destructive",
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.timeWindow")}</CardTitle>
        <CardDescription>{t("settings.timeWindowDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex w-40 flex-col gap-2">
            <Label htmlFor="tw-size">{t("settings.textSize")}</Label>
            <Input
              id="tw-size"
              type="number"
              min={1}
              value={textSize}
              onChange={(e) => setTextSize(e.target.value)}
            />
          </div>

          <div className="flex w-40 flex-col gap-2">
            <Label htmlFor="tw-color">{t("settings.textColor")}</Label>
            <Input
              id="tw-color"
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="h-9 cursor-pointer px-1 py-1"
            />
          </div>

          <Button onClick={() => void save()} disabled={busy}>
            {busy ? t("common.saving") : t("common.save")}
          </Button>
        </div>
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
  const { t } = useTranslation();
  const { toast } = useToast();
  const [presets, setPresets] = useState<ScreenerPreset[]>(() =>
    parseSettings(settings).screener_presets,
  );
  const [busy, setBusy] = useState(false);
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
      setPresets((prev) => prev.map((p) => (p === editing ? preset : p)));
    } else {
      setPresets((prev) => [...prev, preset]);
    }
  };

  const remove = (preset: ScreenerPreset) => {
    setPresets((prev) => prev.filter((p) => p !== preset));
  };

  const save = async () => {
    setBusy(true);
    try {
      await updateProfile({
        settings: {
          ...settings,
          screener_presets: presets,
        },
      });
      await onSaved();
      toast({ variant: "success", description: t("common.saved") });
    } catch (err) {
      toast({
        variant: "destructive",
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.screener")}</CardTitle>
        <CardDescription>{t("settings.screenerDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {presets.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {t("settings.noPresets")}
          </p>
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
                  title={t("common.edit")}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(preset)}
                  title={t("common.delete")}
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
            {t("settings.addPreset")}
          </Button>
          <Button onClick={() => void save()} disabled={busy}>
            {busy ? t("common.saving") : t("common.save")}
          </Button>
        </div>
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
