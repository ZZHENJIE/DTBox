import { getAccessToken, subscribe } from './store'
import { requestRefresh } from './websocket'

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

function buildHeaders(extraHeaders?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  }

  const token = getAccessToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

async function doFetch(config: RequestConfig): Promise<Response> {
  return fetch(config.path, {
    method: config.method,
    headers: buildHeaders(config.headers),
    body: config.body !== undefined ? JSON.stringify(config.body) : undefined,
  })
}

async function readResponse(response: Response, start: number): Promise<ResponseResult> {
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

function waitForToken(): Promise<string> {
  return new Promise((resolve) => {
    const token = getAccessToken()
    if (token) {
      resolve(token)
      return
    }

    const unsubscribe = subscribe(() => {
      const newToken = getAccessToken()
      if (newToken) {
        unsubscribe()
        resolve(newToken)
      }
    })

    setTimeout(() => {
      unsubscribe()
      resolve('')
    }, 15000)
  })
}

export async function sendRequest(config: RequestConfig): Promise<ResponseResult> {
  const start = performance.now()
  const response = await doFetch(config)

  if (response.status === 401 && getAccessToken()) {
    requestRefresh()

    const newToken = await waitForToken()
    if (newToken) {
      const retryStart = performance.now()
      const retryResponse = await doFetch(config)
      return readResponse(retryResponse, retryStart)
    }
  }

  return readResponse(response, start)
}
