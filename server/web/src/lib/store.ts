type AuthState = 'connecting' | 'waiting_token' | 'authenticated' | 'error'

type Listener = () => void

let accessToken: string | null = null
let authState: AuthState = 'connecting'
const listeners = new Set<Listener>()

export function getAccessToken(): string | null {
  return accessToken
}

export function getAuthState(): AuthState {
  return authState
}

export function setAccessToken(token: string): void {
  accessToken = token
  authState = 'authenticated'
  notify()
}

export function clearAccessToken(): void {
  accessToken = null
  authState = 'waiting_token'
  notify()
}

export function setAuthState(state: AuthState): void {
  authState = state
  notify()
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

function notify(): void {
  listeners.forEach((fn) => fn())
}

const WS_PORT_KEY = 'dtbox_ws_port'

export function getStoredWsPort(): string | null {
  return localStorage.getItem(WS_PORT_KEY)
}

export function setStoredWsPort(port: string): void {
  localStorage.setItem(WS_PORT_KEY, port)
}
