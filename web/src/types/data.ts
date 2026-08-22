export type FinvizInterval =
  | "Minute"
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

export type FinvizValidRange =
  | "Day"
  | "Day5"
  | "Month"
  | "Month3"
  | "Month6"
  | "YearToDate"
  | "Year"
  | "Year2"
  | "Year5"
  | "Max";

export interface FinvizStockQuery {
  symbol: string;
  interval: FinvizInterval;
  valid_ranges: FinvizValidRange;
}

export interface FinvizStockItem {
  Date: string;
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Volume: number;
}

export interface FinvizScreenerQuery {
  order_by: string;
  signal?: string | null;
  parameter?: string | null;
}

export interface FinvizScreenerItem {
  "No.": number;
  Ticker: string;
  Company: string;
  Sector: string;
  Industry: string;
  Country: string;
  "Market Cap": number | null;
  "P/E": number | null;
  Price: number | null;
  Change: string | null;
  Volume: number | null;
}

export type FinvizMarketOrdered = "Time" | "Source";
export type FinvizNewsCategory = "News" | "Blogs";
export type FinvizStocksCategory = "ETF" | "NoETF";

export interface FinvizMarketNews {
  Market: {
    ordered: FinvizMarketOrdered;
    category?: FinvizNewsCategory | null;
  };
}

export interface FinvizStocksNews {
  Stocks: {
    symbol: string[];
    category: FinvizStocksCategory;
  };
}

export interface FinvizCryptoNews {
  Crypto: string[];
}

export type FinvizNewsQuery =
  | FinvizMarketNews
  | FinvizStocksNews
  | FinvizCryptoNews;

export interface FinvizNewsItem {
  Title: string;
  Source: string;
  Date: string;
  Url: string;
  Category: string;
  Ticker?: string | null;
}

export type AlpacaFeed =
  | "Sip"
  | "Iex"
  | "DelayedSip"
  | "Boats"
  | "Overnight"
  | "Otc";

export interface AlpacaSnapshotQuery {
  symbol: string;
  feed: AlpacaFeed;
  currency: string;
}

export type StockTape = "A" | "B" | "C" | "N" | "O";

export interface StockBar {
  t: string;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  n: number;
  vw: number;
}

export interface StockTrade {
  t: string;
  i: number;
  x: string;
  p: number;
  s: number;
  c: string[];
  z: StockTape;
  u?: string | null;
}

export interface StockQuote {
  t: string;
  bx: string;
  bp: number;
  bs: number;
  ap: number;
  as: number;
  ax: string;
  c: string[];
  z: StockTape;
}

export interface AlpacaSnapshot {
  symbol: string;
  currency?: string | null;
  latestTrade?: StockTrade | null;
  latestQuote?: StockQuote | null;
  minuteBar?: StockBar | null;
  dailyBar?: StockBar | null;
  prevDailyBar?: StockBar | null;
}

export type IPOType = "OrdinaryShares" | "SPAC";

export interface IPOQuery {
  page_size: number;
  date_from: string;
  date_to: string;
  ipo_type: IPOType;
}

export interface IPOItem {
  currency: string;
  date: string;
  deal_status: string;
  description: string;
  exchange: string;
  id: string;
  initial_filing_date: string;
  insider_lockup_date: string;
  insider_lockup_days: number;
  ipo_type: string;
  last_yr_income: number;
  last_yr_income_year: number;
  last_yr_revenue: number;
  last_yr_revenue_year: number;
  lead_underwriters: string[];
  market_cap_at_offer: number;
  name: string;
  notes: string;
  offering_shares: number;
  offering_shares_ord_adr: number;
  offering_value: number;
  open_date_verified: boolean;
  ord_shares_out_after_offer: number;
  other_underwriters: string[];
  price_max?: string | null;
  price_min?: string | null;
  price_open?: string | null;
  price_public_offering?: string | null;
  pricing_date: string;
  pricing_date_verified: boolean;
  sec_accession_number: string;
  sec_filing_url: string;
  shares_outstanding: number;
  sic: number;
  spac_converted_to_target: boolean;
  state_location: string;
  ticker: string;
  time: string;
  underwriter_quiet_expiration_date?: string | null;
  underwriter_quiet_expiration_days: number;
  updated: number;
}

/* ── Benzinga calendar ── */

export interface BenzingaEconomicsQuery {
  page_size: number;
  date_from: string;
  date_to: string;
}

export interface BenzingaEconomicsItem {
  actual: string;
  actual_t: string;
  consensus: string;
  consensus_t: string;
  country: string;
  description: string;
  event_category: string;
  event_name: string;
  event_period: string;
  id: string;
  importance: number;
  notes: string;
  period_year: number;
  prior: string;
  prior_t: string;
  timestamp: number;
  updated: number;
  // legacy fallback — older backend may still send date/time
  date?: string;
  time?: string;
}

export interface BenzingaEarningsQuery {
  page_size: number;
  date_from: string;
  date_to: string;
}

export interface BenzingaEarningsItem {
  currency: string;
  cusip: string;
  date: string;
  date_confirmed: number;
  eps: string;
  eps_est: string;
  eps_prior: string;
  eps_surprise: string;
  eps_surprise_percent: string;
  eps_type: string;
  exchange: string;
  id: string;
  importance: number;
  isin: string;
  name: string;
  notes: string;
  period: string;
  period_year: number;
  revenue: string;
  revenue_est: string;
  revenue_prior: string;
  revenue_surprise: string;
  revenue_surprise_percent: string;
  revenue_type: string;
  ticker: string;
  time: string;
  updated: number;
}

/* ── Finviz calendar ── */

export interface FinvizEconomicsQuery {
  date_from: string;
  date_to: string;
}

export interface FinvizEconomicsItem {
  Timestamp: number;
  Event: string;
  Impact: number;
  For: string;
  Actual: string;
  Expected: string;
  Prior: string;
}

export interface FinvizEarningsQuery {
  date_from: string;
  date_to: string;
}

export interface FinvizEarningsItem {
  Timestamp: number;
  Ticker: string;
  Company: string;
  "Market Cap": number;
  "EPS Estimate": number | null;
  "EPS Actual": number | null;
  "EPS Surprise": number | null;
  "EPS GAAP Estimate": number | null;
  "EPS GAAP Actual": number | null;
  "EPS GAAP Surprise": number | null;
  "Revenue Estimate": number | null;
  "Revenue Actual": number | null;
  "Revenue Surprise": number | null;
  "1-Day Price Reaction": number | null;
}

/* ── Deprecated aliases (for gradual migration) ── */
/** @deprecated use BenzingaEconomicsQuery */
export type EconomicsQuery = BenzingaEconomicsQuery;
/** @deprecated use BenzingaEconomicsItem */
export type EconomicsItem = BenzingaEconomicsItem;
/** @deprecated use BenzingaEarningsQuery */
export type EarningsQuery = BenzingaEarningsQuery;
/** @deprecated use BenzingaEarningsItem */
export type EarningsItem = BenzingaEarningsItem;
