import { Navigate, Outlet } from 'react-router-dom'
import { getAccessToken } from '~/lib/store'

export function AuthGuard() {
  const token = getAccessToken()

  if (!token) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
