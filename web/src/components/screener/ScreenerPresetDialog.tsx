import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { useToast } from "~/hooks/use-toast";
import { Button } from "~/components/ui/button";
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
import type { ScreenerPreset } from "~/lib/settings";

export function ScreenerPresetDialog({
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
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initial ? t("settings.editPreset") : t("settings.addPresetTitle")}
          </DialogTitle>
          <DialogDescription>{t("settings.presetDesc")}</DialogDescription>
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
  const { t } = useTranslation();
  const { toast } = useToast();
  const [name, setName] = useState(initial?.name ?? "");
  const [orderBy, setOrderBy] = useState(initial?.order_by ?? "");
  const [signal, setSignal] = useState(initial?.signal ?? "");
  const [parameter, setParameter] = useState(initial?.parameter ?? "");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !orderBy.trim()) {
      toast({
        variant: "destructive",
        description: t("settings.nameAndOrderRequired"),
      });
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
        <Label htmlFor="preset-name">{t("settings.presetName")}</Label>
        <Input
          id="preset-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("settings.presetNamePlaceholder")}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="preset-order">{t("settings.orderBy")}</Label>
        <Input
          id="preset-order"
          value={orderBy}
          onChange={(e) => setOrderBy(e.target.value)}
          placeholder={t("settings.orderByPlaceholder")}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="preset-signal">{t("settings.signal")}</Label>
        <Input
          id="preset-signal"
          value={signal}
          onChange={(e) => setSignal(e.target.value)}
          placeholder={t("settings.signalPlaceholder")}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="preset-parameter">{t("settings.parameter")}</Label>
        <Input
          id="preset-parameter"
          value={parameter}
          onChange={(e) => setParameter(e.target.value)}
          placeholder={t("settings.parameterPlaceholder")}
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          {t("common.cancel")}
        </Button>
        <Button type="submit">{t("common.confirm")}</Button>
      </DialogFooter>
    </form>
  );
}
