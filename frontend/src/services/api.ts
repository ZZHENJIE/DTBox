import { notifications } from "@mantine/notifications";

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

const API_BASE = "/api";

let jwtToken: string | null = null;

export function setJwtToken(token: string | null) {
  jwtToken = token;
}

export function getJwtToken() {
  return jwtToken;
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (jwtToken) {
    headers["Authorization"] = `Bearer ${jwtToken}`;
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const data: ApiResponse<T> = await response.json();

  if (data.code !== 0) {
    notifications.show({
      title: "Error",
      message: data.message,
      color: "red",
    });
    throw new Error(data.message);
  }

  return data.data;
}

export const api = {
  get: <T>(url: string) => request<T>(url, { method: "GET" }),
  post: <T>(url: string, body?: unknown) =>
    request<T>(url, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T>(url: string, body?: unknown) =>
    request<T>(url, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(url: string) => request<T>(url, { method: "DELETE" }),
};

export const authApi = {
  checkUsernameExists: (name: string) =>
    api.get<boolean>(`/users/exists?name=${encodeURIComponent(name)}`),

  register: (name: string, password: string) =>
    api.post<boolean>("/users/register", { name, password }),

  login: (name: string, password: string) =>
    api.post<void>("/users/login", { name, password }),

  refresh: () => api.post<string>("/users/refresh", {}),

  getUserInfo: () =>
    api.get<{
      id: number;
      name: string;
      config: Record<string, unknown>;
      permissions: number;
      create_time: string;
    }>("/users/info"),

  changeName: (name: string) =>
    api.post<boolean>("/users/change", { type: "Name", data: name }),

  changeConfig: (config: Record<string, unknown>) =>
    api.post<boolean>("/users/change", { type: "Config", data: config }),

  logout: () => api.post<void>("/users/logout", {}),
};

export const versionApi = {
  get: () => api.get<string>("/version"),
};

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

export interface IposcoopItem {
  company: string;
  symbol: string;
  managers: string;
  shares_millions: string;
  price_high: string;
  price_low: string;
  expected_date: string;
}

export const economyApi = {
  Finviz: (begin: string, end: string) =>
    api.post<EconomyFinvizItem[]>("/calendar/economy/finviz", { begin, end }),
};

export const ipoApi = {
  Scoop: () => api.get<IposcoopItem[]>("/calendar/ipo/scoop"),
};
