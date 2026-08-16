import { useTranslation } from "react-i18next";

export default function TestPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("testPage.title")}</h1>
        <p className="text-muted-foreground text-sm">{t("testPage.subtitle")}</p>
      </div>
    </div>
  );
}
