import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'
import { Spinner } from './ui/Spinner'

/**
 * Protege rotas: sem sessão, redireciona ao login (lembrando a página pedida).
 * Com `roles`, também bloqueia perfis sem permissão, mandando-os ao painel.
 */
export function RequireAuth({ roles }) {
  const { status, user } = useAuth()
  const location = useLocation()

  if (status === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Carregando sessão…" />
      </div>
    )
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
