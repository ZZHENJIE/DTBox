import { api, ApiError } from "./api";

// ================== Market Data ==================

// Finviz Screener
export interface FinvizScreenerRequest {
  query: string;
}

export interface FinvizScreenerResult {
  "No.": number;
  Ticker: string;
  Company: string;
  Sector: string;
  Industry: string;
  Country: string;
  "Market Cap": number;
  "P/E": number;
  Price: number;
  Change: string;
  Volume: number;
}

// Finviz Quote
export interface FinvizQuoteRequest {
  symbol: string;
  date_from?: number | null;
  interval?:
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
}

export interface FinvizQuoteResponse {
  ticker: string;
  timeframe: string;
  volume: number[];
  date: number[];
  open: number[];
  high: number[];
  low: number[];
  close: number[];
  last_open: number;
  last_high: number;
  last_low: number;
  last_close: number;
  last_volume: number;
  data_id: string;
  last_date: number;
  last_time: number;
  prev_close: number;
  after_close: number | null;
  after_change: number | null;
  after_time: number | null;
  update_olhc_version: number;
  chart_events: unknown[];
}

// Finviz Event
export type FinvizEventType = "News" | "Blogs" | "Stock" | "ETF";

export interface FinvizEventRequest {
  type: FinvizEventType;
  symbol?: string;
}

export interface FinvizEventItem {
  Title: string;
  Source: string;
  Date: string;
  Url: string;
  Category: string;
  Ticker?: string;
}

// Finviz Candlestick
export interface FinvizCandlestickRequest {
  symbol: string;
  interval:
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
  space: "d1" | "d5" | "m1" | "m3" | "m6" | "ytd" | "y1" | "y2" | "y5" | "max";
}

export interface FinvizCandlestickItem {
  Date: string;
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Volume: number;
}

// Finviz Economic Calendar
export interface FinvizCalendarEconomyRequest {
  begin: string;
  end: string;
}

export interface FinvizCalendarEconomyItem {
  calendarId: number;
  ticker: string | null;
  event: string;
  category: string;
  date: string;
  reference: string | null;
  referenceDate: string | null;
  actual: string | null;
  previous: string | null;
  forecast: string | null;
  teforecast: string | null;
  importance: number;
  isHigherPositive: number;
  hasNoDetail: boolean;
  alert: string | null;
  allDay: boolean;
  nonEmptinessScore: number;
}

// IPO Scoop
export interface IpoScoopItem {
  symbol: string;
  companyName: string;
  price: number;
  shares: number;
  date: string;
}

// SPAC Research
export interface SpacResearchItem {
  symbol: string;
  companyName: string;
  price: number;
  date: string;
}

// Health Check
export interface HealthStatus {
  status: "ok" | string;
  version: string;
}

// Market 服务
export const marketService = {
  // Finviz Screener - 获取股票筛选结果
  async getScreener(query: string): Promise<FinvizScreenerResult[]> {
    const response = await api.post<FinvizScreenerResult[]>(
      "/market/finviz/screener",
      { query },
    );

    if (!response.success || !response.data) {
      throw new ApiError(
        "SCREENER_FAILED",
        response.message || "获取筛选结果失败",
      );
    }

    return response.data;
  },

  // Finviz Quote - 获取股票报价数据
  async getQuote(request: FinvizQuoteRequest): Promise<FinvizQuoteResponse> {
    const response = await api.post<FinvizQuoteResponse>(
      "/market/finviz/quote",
      request,
    );

    if (!response.success || !response.data) {
      throw new ApiError("QUOTE_FAILED", response.message || "获取报价失败");
    }

    return response.data;
  },

  // Finviz Event - 获取新闻/事件
  async getEvent(request: FinvizEventRequest): Promise<FinvizEventItem[]> {
    const response = await api.post<FinvizEventItem[]>(
      "/market/finviz/event",
      request,
    );

    if (!response.success || !response.data) {
      throw new ApiError("EVENT_FAILED", response.message || "获取事件失败");
    }

    return response.data;
  },

  // Finviz Candlestick - 获取历史K线数据
  async getCandlestick(
    request: FinvizCandlestickRequest,
  ): Promise<FinvizCandlestickItem[]> {
    const response = await api.post<FinvizCandlestickItem[]>(
      "/market/finviz/candlestick",
      request,
    );

    if (!response.success || !response.data) {
      throw new ApiError(
        "CANDLESTICK_FAILED",
        response.message || "获取K线数据失败",
      );
    }

    return response.data;
  },

  // Finviz Economic Calendar - 获取经济日历
  async getCalendarEconomy(
    begin: string,
    end: string,
  ): Promise<FinvizCalendarEconomyItem[]> {
    const response = await api.post<FinvizCalendarEconomyItem[]>(
      "/market/finviz/calendar_economy",
      {
        begin,
        end,
      },
    );

    if (!response.success || !response.data) {
      throw new ApiError(
        "CALENDAR_FAILED",
        response.message || "获取经济日历失败",
      );
    }

    return response.data;
  },

  // IPO Scoop - 获取即将上市的IPO数据
  async getIpoScoop(): Promise<IpoScoopItem[]> {
    const response = await api.get<IpoScoopItem[]>(
      "/market/integrations/ipo_scoop",
    );

    if (!response.success || !response.data) {
      throw new ApiError(
        "IPO_SCOOP_FAILED",
        response.message || "获取IPO数据失败",
      );
    }

    return response.data;
  },

  // SPAC Research - 获取SPAC数据
  async getSpacResearch(): Promise<SpacResearchItem[]> {
    const response = await api.get<SpacResearchItem[]>(
      "/market/integrations/spac_research",
    );

    if (!response.success || !response.data) {
      throw new ApiError("SPAC_FAILED", response.message || "获取SPAC数据失败");
    }

    return response.data;
  },
};

// Health 服务
export const healthService = {
  // 检查API服务器健康状态
  async checkHealth(): Promise<HealthStatus> {
    const response = await api.get<HealthStatus>("/health");

    if (!response.success || !response.data) {
      throw new ApiError(
        "HEALTH_CHECK_FAILED",
        response.message || "健康检查失败",
      );
    }

    return response.data;
  },
};
