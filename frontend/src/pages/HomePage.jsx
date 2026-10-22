import { useAuth } from '../hooks/useAuth'
import { MyAssetsPage } from './MyAssetsPage'
import { PortfolioPage } from './PortfolioPage'

/** Página inicial conforme o perfil: carteira completa (NIT) ou "Meus ativos" (AUTOR). */
export function HomePage() {
  const { user } = useAuth()
  return user.role === 'NIT' ? <PortfolioPage /> : <MyAssetsPage />
}
