import { Post } from "../Core";

export interface EconomyFinvizItem {
  actual: string | null;
  previous: string | null;
  forecast: string | null;
  teforecast: string | null;

  alert: string | null;
  reference: string | null;
  referenceDate: string | null;

  allDay: boolean;
  hasNoDetail: boolean;

  calendarId: number;
  importance: number;
  isHigherPositive: 0 | 1;
  nonEmptinessScore: number;

  category: string;
  event: string;
  date: string;
  ticker: string;
}

export const EconomyFinviz = async (begin: string, end: string) => {
  return await Post<EconomyFinvizItem[]>("/api/calendar/economy/finviz", {
    begin,
    end,
  });
};
