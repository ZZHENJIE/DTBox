import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";

export default function UnavailablePage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <AlertTriangle className="text-destructive size-10" />
        <h1 className="text-xl font-semibold">{t("unavailable.title")}</h1>
        <p className="text-muted-foreground text-sm">{t("unavailable.desc")}</p>
      </div>
    </div>
  );
}
