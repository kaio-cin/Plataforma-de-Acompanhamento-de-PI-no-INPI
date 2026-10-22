import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

/**
 * Casca das telas autenticadas: barra lateral, barra superior e conteúdo.
 * A busca da barra superior é compartilhada com as páginas via contexto do Outlet.
 */
export function DashboardLayout() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState('')

  function handleSearchChange(value) {
    setSearch(value)
    // A busca atua sobre a carteira; digitar em outra tela leva até ela.
    if (location.pathname !== '/') navigate('/')
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[264px_1fr]">
      <aside className="hidden bg-navy lg:block">
        <div className="sticky top-0 h-screen">
          <Sidebar role={user.role} />
        </div>
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/40"
            aria-label="Fechar menu"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="relative h-full w-[264px] shadow-raised">
            <Sidebar role={user.role} onNavigate={() => setMenuOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-col">
        <Topbar search={search} onSearchChange={handleSearchChange} onOpenMenu={() => setMenuOpen(true)} />
        <main className="flex flex-1 flex-col gap-6 px-4 pt-8 pb-10 sm:px-6 lg:px-10">
          <Outlet context={{ search, setSearch }} />
        </main>
      </div>
    </div>
  )
}
