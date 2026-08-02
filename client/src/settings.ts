export interface Settings {
  host: string;
  port: number;
}

export function loadSettings(): Settings | null {
  const raw = localStorage.getItem("settings");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (
      typeof parsed.host === "string" &&
      typeof parsed.port === "number"
    ) {
      return parsed as Settings;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveSettings(s: Settings): void {
  localStorage.setItem("settings", JSON.stringify(s));
}
