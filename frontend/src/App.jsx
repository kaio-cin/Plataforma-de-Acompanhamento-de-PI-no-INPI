import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { RequireAuth } from './components/RequireAuth'
import { AuthProvider } from './context/AuthProvider'
import { DashboardLayout } from './layouts/DashboardLayout'
import { LoginPage } from './pages/LoginPage'
import { NewAssetPage } from './pages/NewAssetPage'
import { PortfolioPage } from './pages/PortfolioPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<RequireAuth />}>
            <Route element={<DashboardLayout />}>
              <Route index element={<PortfolioPage />} />

              <Route element={<RequireAuth roles={['NIT']} />}>
                <Route path="ativos/novo" element={<NewAssetPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
