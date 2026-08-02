import { setAccessToken, clearAccessToken, setAuthState, getAuthState } from './store'

interface WsMessage {
  type: string
  token?: string
  message?: string
}

type WsState = 'disconnected' | 'connecting' | 'connected'

let ws: WebSocket | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let wsState: WsState = 'disconnected'
let onStateChange: ((state: WsState) => void) | null = null

export function getWsState(): WsState {
  return wsState
}

export function setOnWsStateChange(fn: (state: WsState) => void): void {
  onStateChange = fn
}

function updateWsState(state: WsState): void {
  wsState = state
  onStateChange?.(state)
}

export function connect(port: string): void {
  if (ws && ws.readyState === WebSocket.OPEN) return

  updateWsState('connecting')
  setAuthState('connecting')

  try {
    ws = new WebSocket(`ws://127.0.0.1:${port}`)
  } catch {
    setAuthState('error')
    updateWsState('disconnected')
    return
  }

  ws.onopen = () => {
    updateWsState('connected')
    setAuthState('waiting_token')
  }

  ws.onmessage = (event: MessageEvent) => {
    try {
      const msg: WsMessage = JSON.parse(event.data)

      switch (msg.type) {
        case 'access_token':
          if (msg.token) {
            setAccessToken(msg.token)
          }
          break
        case 'error':
          console.error('[DTBox WS] Error:', msg.message || 'Unknown error')
          break
      }
    } catch {
      // ignore malformed messages
    }
  }

  ws.onclose = () => {
    updateWsState('disconnected')
    if (getAuthState() !== 'authenticated') {
      setAuthState('error')
    }
    ws = null
    scheduleReconnect(port)
  }

  ws.onerror = () => {
    // onclose will fire after this
  }
}

export function requestRefresh(): void {
  if (ws && wsState === 'connected') {
    ws.send(JSON.stringify({ type: 'refresh' }))
  }
}

export function clearAndDisconnect(): void {
  clearAccessToken()
  ws?.close()
  ws = null
  updateWsState('disconnected')
}

function scheduleReconnect(port: string): void {
  if (reconnectTimer) clearTimeout(reconnectTimer)
  reconnectTimer = setTimeout(() => {
    if (wsState === 'disconnected') {
      connect(port)
    }
  }, 3000)
}

// Auto-bootstrap for /open page
export function bootstrapFromUrl(): boolean {
  const port = new URLSearchParams(location.search).get('ws_port')
  if (port) {
    connect(port)
    return true
  }
  return false
}
