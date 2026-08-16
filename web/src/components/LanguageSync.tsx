import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { storeLocale } from "~/i18n";
import { useAuth } from "~/hooks/use-auth";
import { parseSettings } from "~/lib/settings";

export function LanguageSync() {
  const { user } = useAuth();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (!user) return;

    const lang = parseSettings(user.settings).language;
    document.documentElement.lang = lang;
    storeLocale(lang);

    if (i18n.language !== lang) {
      void i18n.changeLanguage(lang);
    }
  }, [user, i18n]);

  return null;
}
