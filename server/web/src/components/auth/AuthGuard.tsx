import { useState, useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { getAccessToken, getAuthState, subscribe } from '~/lib/store'
import { ConnectingSpinner } from './ConnectingSpinner'

export function AuthGuard() {
  const token = getAccessToken()
  const authState = getAuthState()
  const [_, setTick] = useState(0)

  useEffect(() => {
    if (token) return
    const unsubscribe = subscribe(() => setTick((t) => t + 1))
    return unsubscribe
  }, [token])

  if (token) {
    return <Outlet />
  }

  const isConnecting = authState === 'connecting' || authState === 'waiting_token'
  if (isConnecting) {
    return <ConnectingSpinner message="正在连接 DTBox 客户端..." />
  }

  return <Navigate to="/unauthorized" replace />
}
