import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { bootstrapFromUrl } from './lib/websocket'
import { getAccessToken } from './lib/store'
import { OpenPage } from './components/auth/OpenPage'
import { AuthGuard } from './components/auth/AuthGuard'
import { UnauthorizedPage } from './components/auth/UnauthorizedPage'
import { AppLayout } from './components/layout/AppLayout'
import { Dashboard } from './components/dashboard/Dashboard'
import { ProfilePage } from './components/profile/ProfilePage'
import { PasswordChange } from './components/profile/PasswordChange'
import { AdminUsers } from './components/admin/AdminUsers'
import { ChartPage } from './components/chart/ChartPage'
import { FinvizStockPage } from './components/finviz/FinvizStockPage'

function AppInit() {
  useEffect(() => {
    if (!getAccessToken()) {
      bootstrapFromUrl()
    }
  }, [])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInit />
      <Routes>
        <Route path="/open" element={<OpenPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route element={<AuthGuard />}>
          <Route element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="password" element={<PasswordChange />} />
            <Route path="chart" element={<ChartPage />} />
            <Route path="finviz/stock" element={<FinvizStockPage />} />
            <Route path="admin/users" element={<AdminUsers />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
