export interface ApiResponse<T = unknown> {
  success: boolean
  data: T | null
  message: string | null
}

export interface UserCheckQuery {
  name: string
}

export interface UserCheckResult {
  exists: boolean
}

export interface UserCreateRequest {
  name: string
  password: string
}

export interface UserCreateResult {
  user_id: number
}

export interface UserLoginRequest {
  name: string
  password: string
}

export interface UserLoginResult {
  access_token: string
  refresh_token: string
  user_id: number
}

export interface UserPasswordRequest {
  old_password: string
  new_password: string
}

export interface UserProfileRequest {
  name?: string
  avatar?: string
  settings?: Record<string, unknown>
}

export interface UserRefreshResult {
  access_token: string
}

export interface InfoResult {
  id: number
  name: string
  avatar: string
  role: number
  settings: Record<string, unknown>
  created_at: string
}

export interface AdminInfoResult {
  users: InfoResult[]
  total: number
  page: number
  page_size: number
}

export interface AdminChangeRequest {
  user_id: number
  name?: string
  avatar?: string
  role?: number
  settings?: Record<string, unknown>
}

export type Role = 1 | 2 | 5

export const ROLE_LABELS: Record<Role, string> = {
  1: '用户',
  2: '订阅者',
  5: '管理员',
}

export const ROLE_ADMIN: Role = 5

// Finviz
export interface QuoteQuery {
  symbol: string
  interval: string
  valid_ranges: string
}

export interface QuoteItem {
  Date: string
  Open: number
  High: number
  Low: number
  Close: number
  Volume: number
}

// Stock search
export interface StockItem {
  id: number
  symbol: string
  name: string
  logo?: string
}

export interface StockSearchResult {
  stocks: StockItem[]
  total: number
  page: number
  limit: number
}

// WebSocket message types (Web ↔ Client)
export interface WsAccessTokenMessage {
  type: 'access_token'
  token: string
}

export interface WsErrorMessage {
  type: 'error'
  message: string
}

export interface WsRefreshRequest {
  type: 'refresh'
}

export type WsClientMessage = WsAccessTokenMessage | WsErrorMessage
export type WsWebMessage = WsRefreshRequest
