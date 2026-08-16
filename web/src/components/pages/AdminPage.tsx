import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";

import { useAuth } from "~/hooks/use-auth";
import { useToast } from "~/hooks/use-toast";
import { adminChange, adminInfo } from "~/lib/endpoints";
import { parseSettings, type ScreenerPreset } from "~/lib/settings";
import type { InfoResult } from "~/types/api";
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
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Skeleton } from "~/components/ui/skeleton";
import { ScreenerPresetDialog } from "~/components/screener/ScreenerPresetDialog";

const ROLES = [
  { value: 1, label: "role.user" },
  { value: 2, label: "role.subscriber" },
  { value: 5, label: "role.admin" },
];

const selectClass =
  "border-input bg-transparent dark:bg-input/30 h-8 w-28 rounded-md border px-2 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none";

export default function AdminPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();

  const [users, setUsers] = useState<InfoResult[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [screenerOpen, setScreenerOpen] = useState(false);
  const [screenerTarget, setScreenerTarget] = useState<InfoResult | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const fetchPage = (p: number) =>
    adminInfo(p)
      .then((res) => {
        setUsers(res.users);
        setTotal(res.total);
        setPageSize(res.page_size);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : String(err));
        setUsers([]);
      });

  useEffect(() => {
    let cancelled = false;

    fetchPage(1).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const goto = (p: number) => {
    setPage(p);
    setLoading(true);
    setError(null);
    void fetchPage(p).finally(() => setLoading(false));
  };

  const changeRole = async (userId: number, role: number) => {
    try {
      await adminChange({ user_id: userId, role });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role } : u)),
      );
    } catch (err) {
      toast({
        variant: "destructive",
        description: err instanceof Error ? err.message : String(err),
      });
    }
  };

  const openScreener = (u: InfoResult) => {
    setScreenerTarget(u);
    setScreenerOpen(true);
  };

  if (user && user.role !== 5) {
    return (
      <p className="text-muted-foreground text-sm">{t("admin.noPermission")}</p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("admin.title")}</h1>
        <p className="text-muted-foreground text-sm">{t("admin.subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.userList")}</CardTitle>
          <CardDescription>{t("admin.userCount", { count: total })}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : error ? (
            <p className="text-destructive text-sm">{error}</p>
          ) : users.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t("admin.noUsers")}</p>
          ) : (
            <>
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted text-xs">
                    <tr>
                      <th className="px-3 py-2 font-medium">ID</th>
                      <th className="px-3 py-2 font-medium">
                        {t("admin.username")}
                      </th>
                      <th className="px-3 py-2 font-medium">{t("admin.role")}</th>
                      <th className="px-3 py-2 font-medium">
                        {t("admin.createdAt")}
                      </th>
                      <th className="px-3 py-2 font-medium">
                        {t("admin.action")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-t">
                        <td className="px-3 py-2 font-mono">{u.id}</td>
                        <td className="px-3 py-2 font-medium">{u.name}</td>
                        <td className="px-3 py-2">
                          <select
                            className={selectClass}
                            value={u.role}
                            onChange={(e) =>
                              void changeRole(u.id, Number(e.target.value))
                            }
                          >
                            {ROLES.map((r) => (
                              <option key={r.value} value={r.value}>
                                {t(r.label)}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="text-muted-foreground px-3 py-2">
                          {u.created_at}
                        </td>
                        <td className="px-3 py-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openScreener(u)}
                          >
                            <SlidersHorizontal />
                            {t("admin.settings")}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("screener.pageInfo", { page, total: totalPages })}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => goto(page - 1)}
                  >
                    <ChevronLeft />
                    {t("common.prevPage")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => goto(page + 1)}
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

      <Dialog open={screenerOpen} onOpenChange={setScreenerOpen}>
        <DialogContent className="sm:max-w-lg">
          {screenerTarget && (
            <UserScreenerEditor
              key={screenerTarget.id}
              target={screenerTarget}
              onSaved={(updated) => {
                setUsers((prev) =>
                  prev.map((x) => (x.id === updated.id ? updated : x)),
                );
                setScreenerOpen(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UserScreenerEditor({
  target,
  onSaved,
}: {
  target: InfoResult;
  onSaved: (updated: InfoResult) => void;
}) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [presets, setPresets] = useState<ScreenerPreset[]>(() =>
    parseSettings(target.settings).screener_presets,
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
      const updated = await adminChange({
        user_id: target.id,
        settings: {
          ...target.settings,
          screener_presets: presets,
        },
      });
      onSaved(updated);
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
    <div className="flex min-w-0 flex-col gap-4">
      <DialogHeader>
        <DialogTitle>{t("admin.screenerSettings")}</DialogTitle>
        <DialogDescription>
          {t("admin.screenerSettingsDesc", { name: target.name })}
        </DialogDescription>
      </DialogHeader>

      {presets.length === 0 ? (
        <p className="text-muted-foreground text-sm">{t("settings.noPresets")}</p>
      ) : (
        <ul className="flex max-h-[50vh] flex-col divide-y overflow-y-auto rounded-md border">
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

      <ScreenerPresetDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
