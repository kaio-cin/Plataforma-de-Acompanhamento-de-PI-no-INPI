import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import { Icon } from '../components/ui/Icon'
import { useAuth } from '../hooks/useAuth'
import { ROLE_LABELS } from '../utils/format'
import { Sidebar } from './Sidebar'

/** Casca das telas autenticadas: barra lateral, cabeçalho com o usuário e área de conteúdo. */
export function DashboardLayout() {
  const { user, logout } = useAuth()
  // No mobile, o menu se fecha pelo clique em um item (onNavigate) ou no fundo escurecido.
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[232px_1fr]">
      {/* Barra lateral fixa (desktop) */}
      <aside className="hidden border-r border-line bg-white lg:block">
        <div className="sticky top-0">
          <Sidebar role={user.role} />
        </div>
      </aside>

      {/* Gaveta lateral (mobile) */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/30"
            aria-label="Fechar menu"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="relative h-full w-64 bg-white shadow-xl">
            <Sidebar role={user.role} onNavigate={() => setMenuOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-col">
        <header className="flex items-center gap-3 border-b border-line bg-white px-4 py-3 sm:px-8">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="-ml-1 rounded-md p-1.5 text-subink hover:bg-canvas lg:hidden"
            aria-label="Abrir menu"
          >
            <Icon name="menu" className="size-5" />
          </button>

          <div className="ml-auto flex min-w-0 items-center gap-3">
            <div className="min-w-0 text-right">
              <p className="truncate text-[13px] font-medium text-ink">{user.email}</p>
              <p className="text-xs text-subink">{ROLE_LABELS[user.role] ?? user.role}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-[13px] text-subink transition-colors hover:bg-canvas hover:text-ink"
            >
              <Icon name="logout" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-7 sm:px-8 lg:px-9">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
