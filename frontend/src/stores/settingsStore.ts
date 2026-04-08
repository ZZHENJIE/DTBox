import { create } from "zustand";

export const DEFAULT_SETTINGS: UserSettings = {
  finviz: {
    screener: {
      page_count: 20,
      auto_refersh: 10,
      parameter: [],
    },
    thumbnail: {
      interval: "Minutes",
      pre_market: false,
      after_hours: false,
    },
  },
  subscription: [],
};

export interface FinvizScreenerParameter {
  label: string;
  value: string;
}

export type FinvizInterval =
  | "Minutes"
  | "Minutes2"
  | "Minutes3"
  | "Minutes5"
  | "Minutes10"
  | "Minutes15"
  | "Minutes30"
  | "Hour"
  | "Hour2"
  | "Hour4"
  | "Day"
  | "Week"
  | "Month";

export const FINVIZ_INTERVAL_MAP: Record<FinvizInterval, string> = {
  Minutes: "i1",
  Minutes2: "i2",
  Minutes3: "i3",
  Minutes5: "i5",
  Minutes10: "i10",
  Minutes15: "i15",
  Minutes30: "i30",
  Hour: "h",
  Hour2: "h2",
  Hour4: "h4",
  Day: "d",
  Week: "w",
  Month: "m",
};

export interface UserSettings {
  finviz: {
    screener: {
      page_count: 20 | 30 | 60;
      auto_refersh: 10 | 30 | 60 | 180;
      parameter: FinvizScreenerParameter[];
    };
    thumbnail: {
      interval: FinvizInterval;
      pre_market: boolean;
      after_hours: boolean;
    };
  };
  subscription: string[];
}

interface SettingsState {
  settings: UserSettings;
  isLoading: boolean;
  setSettings: (settings: UserSettings) => void;
  setLoading: (loading: boolean) => void;
  updateSettings: (updates: Partial<UserSettings>) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: DEFAULT_SETTINGS,
  isLoading: false,

  setSettings: (settings) => set({ settings }),
  setLoading: (isLoading) => set({ isLoading }),
  updateSettings: (updates) =>
    set((state) => ({
      settings: { ...state.settings, ...updates },
    })),
}));
