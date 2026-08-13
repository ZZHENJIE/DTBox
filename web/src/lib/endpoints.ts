import { apiRequest, apiBlob } from "./api";
import type {
  AdminChangeRequest,
  AdminInfoResult,
  HealthCheckResult,
  InfoResult,
  StockSearchResult,
  UserCheckResult,
  UserCreateResult,
  UserPasswordRequest,
  UserProfileRequest,
} from "~/types/api";
import type {
  AlpacaSnapshot,
  AlpacaSnapshotQuery,
  EarningsItem,
  EarningsQuery,
  EconomicsItem,
  EconomicsQuery,
  FinvizNewsItem,
  FinvizNewsQuery,
  FinvizScreenerItem,
  FinvizScreenerQuery,
  FinvizStockItem,
  FinvizStockQuery,
  IPOItem,
  IPOQuery,
} from "~/types/data";

const JSON_HEADERS: HeadersInit = { "Content-Type": "application/json" };

function post<T>(path: string, body: unknown, withAuth = true): Promise<T> {
  return apiRequest<T>(
    path,
    { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(body) },
    withAuth,
  );
}

export const health = () =>
  apiRequest<HealthCheckResult>("/api/health", {}, false);

export const checkUser = (name: string) =>
  apiRequest<UserCheckResult>(
    `/api/user/check?name=${encodeURIComponent(name)}`,
    {},
    false,
  );

export const createUser = (name: string, password: string) =>
  post<UserCreateResult>(
    "/api/user/create",
    { name, password },
    false,
  );

export const logout = () => apiRequest<void>("/api/user/logout", { method: "POST" });

export const changePassword = (req: UserPasswordRequest) =>
  post<void>("/api/user/password", req);

export const updateProfile = (req: UserProfileRequest) =>
  post<InfoResult>("/api/user/profile", req);

export const me = () => apiRequest<InfoResult>("/api/user/me");

export const adminInfo = (page: number) =>
  apiRequest<AdminInfoResult>(`/api/admin/info/${page}`);

export const adminChange = (req: AdminChangeRequest) =>
  post<InfoResult>("/api/admin/change", req);

export const searchStocks = (symbol: string, page = 1, limit = 20) =>
  apiRequest<StockSearchResult>(
    `/api/stock/search?symbol=${encodeURIComponent(symbol)}&page=${page}&limit=${limit}`,
  );

export const klineChart = (query: FinvizStockQuery) =>
  apiBlob("/api/stock/kline_chart", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(query),
  });

export const finvizStock = (query: FinvizStockQuery) =>
  post<FinvizStockItem[]>("/api/finviz/stock", query);

export const finvizScreener = (query: FinvizScreenerQuery) =>
  post<FinvizScreenerItem[]>("/api/finviz/screener", query);

export const finvizNews = (query: FinvizNewsQuery) =>
  post<FinvizNewsItem[]>("/api/finviz/news", query);

export const alpacaSnapshot = (query: AlpacaSnapshotQuery) =>
  post<AlpacaSnapshot>("/api/alpaca/snapshot", query);

export const benzingaIpo = (query: IPOQuery) =>
  post<IPOItem[]>("/api/benzinga/calendar/ipo", query);

export const benzingaEconomics = (query: EconomicsQuery) =>
  post<EconomicsItem[]>("/api/benzinga/calendar/economics", query);

export const benzingaEarnings = (query: EarningsQuery) =>
  post<EarningsItem[]>("/api/benzinga/calendar/earnings", query);

export const akamaiTimestamp = () => apiRequest<number>("/api/tool/timestamp/akamai");
