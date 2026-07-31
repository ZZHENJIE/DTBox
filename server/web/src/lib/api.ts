const STORAGE_KEY_ACCESS = 'dtbox_access_token'
const STORAGE_KEY_REFRESH = 'dtbox_refresh_token'

export function getTokens(): { accessToken: string | null; refreshToken: string | null } {
  return {
    accessToken: localStorage.getItem(STORAGE_KEY_ACCESS),
    refreshToken: localStorage.getItem(STORAGE_KEY_REFRESH),
  }
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(STORAGE_KEY_ACCESS, accessToken)
  localStorage.setItem(STORAGE_KEY_REFRESH, refreshToken)
}

export function clearTokens(): void {
  localStorage.removeItem(STORAGE_KEY_ACCESS)
  localStorage.removeItem(STORAGE_KEY_REFRESH)
}

export interface RequestConfig {
  method: string
  path: string
  headers?: Record<string, string>
  body?: unknown
}

export interface ResponseResult {
  status: number
  statusText: string
  headers: Record<string, string>
  body: string
  timeMs: number
}

export async function sendRequest(config: RequestConfig): Promise<ResponseResult> {
  const { accessToken, refreshToken } = getTokens()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...config.headers,
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }
  if (refreshToken) {
    headers['X-Refresh-Token'] = refreshToken
  }

  const start = performance.now()
  const response = await fetch(config.path, {
    method: config.method,
    headers,
    body: config.body !== undefined ? JSON.stringify(config.body) : undefined,
  })
  const end = performance.now()

  const resHeaders: Record<string, string> = {}
  response.headers.forEach((value, key) => {
    resHeaders[key] = value
  })

  const body = await response.text()

  return {
    status: response.status,
    statusText: response.statusText,
    headers: resHeaders,
    body,
    timeMs: Math.round((end - start) * 100) / 100,
  }
}
