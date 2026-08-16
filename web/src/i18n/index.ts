import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enUS from "./locales/en-US.json";
import zhCN from "./locales/zh-CN.json";

export type Locale = "en-US" | "zh-CN";

export const LOCALES: Locale[] = ["en-US", "zh-CN"];

export const DEFAULT_LOCALE: Locale = "en-US";

const STORAGE_KEY = "dtbox.language";

export function isLocale(value: unknown): value is Locale {
  return value === "en-US" || value === "zh-CN";
}

export function getStoredLocale(): Locale {
  const value = localStorage.getItem(STORAGE_KEY);
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function storeLocale(locale: Locale): void {
  localStorage.setItem(STORAGE_KEY, locale);
}

void i18n.use(initReactI18next).init({
  resources: {
    "en-US": { translation: enUS },
    "zh-CN": { translation: zhCN },
  },
  lng: getStoredLocale(),
  fallbackLng: DEFAULT_LOCALE,
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export default i18n;
