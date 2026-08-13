export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string | null;
}

export interface HealthCheckResult {
  version: string;
}

export interface InfoResult {
  id: number;
  name: string;
  avatar: string;
  role: number;
  settings: Record<string, unknown>;
  created_at: string;
}

export interface UserCheckResult {
  exists: boolean;
}

export interface UserCreateRequest {
  name: string;
  password: string;
}

export interface UserCreateResult {
  user_id: number;
}

export interface UserLoginRequest {
  name: string;
  password: string;
}

export interface UserLoginResult {
  access_token: string;
  refresh_token: string;
  user_id: number;
}

export interface UserPasswordRequest {
  old_password: string;
  new_password: string;
}

export interface UserProfileRequest {
  name?: string;
  avatar?: string;
  settings?: Record<string, unknown>;
}

export interface UserRefreshResult {
  access_token: string;
}

export interface AdminInfoResult {
  users: InfoResult[];
  total: number;
  page: number;
  page_size: number;
}

export interface AdminChangeRequest {
  user_id: number;
  name?: string;
  avatar?: string;
  role?: number;
  settings?: Record<string, unknown>;
}

export interface StockItem {
  id: number;
  symbol: string;
  name: string;
  logo?: string;
}

export interface StockSearchResult {
  stocks: StockItem[];
  total: number;
  page: number;
  limit: number;
}
