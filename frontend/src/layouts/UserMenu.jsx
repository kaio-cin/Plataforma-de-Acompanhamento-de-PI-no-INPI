import { useEffect, useRef, useState } from 'react'

import { Avatar } from '../components/ui/Avatar'
import { Icon } from '../components/ui/Icon'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { displayName, ROLE_LABELS } from '../utils/format'

const MENU_ITEM =
  'flex h-10 w-full items-center gap-2.5 rounded-sm px-3 text-left text-sm font-semibold text-ink hover:bg-surface-muted'

/** Botão do usuário na barra superior, com menu de tema e saída. */
export function UserMenu() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const name = displayName(user.email)

  // Fecha ao clicar fora ou apertar Esc.
  useEffect(() => {
    if (!open) return
    function handlePointer(event) {
      if (!containerRef.current?.contains(event.target)) setOpen(false)
    }
    function handleKey(event) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-3 rounded-full border border-line bg-surface py-1 pr-3 pl-1 text-left hover:bg-surface-muted"
      >
        <Avatar name={name} size={34} />
        <div className="hidden min-w-0 sm:block">
          <div className="max-w-56 truncate text-sm leading-[18px] font-bold text-ink">{name}</div>
          <div className="text-xs leading-4 font-semibold text-ink-subtle">{ROLE_LABELS[user.role] ?? user.role}</div>
        </div>
        <Icon name="abaixo" size={16} className="text-ink-subtle" />
      </button>

      {open && (
        <div role="menu" className="absolute top-full right-0 z-50 mt-2 w-60 rounded-lg border border-line bg-surface p-2 shadow-raised">
          <div className="truncate px-3 pt-1 pb-2 type-caption text-ink-subtle">{user.email}</div>
          <button type="button" role="menuitem" className={MENU_ITEM} onClick={toggleTheme}>
            <Icon name={theme === 'dark' ? 'sol' : 'lua'} size={18} />
            {theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
          </button>
          <hr className="my-1.5 border-line" />
          <button type="button" role="menuitem" className={MENU_ITEM} onClick={logout}>
            <Icon name="sair" size={18} />
            Sair
          </button>
        </div>
      )}
    </div>
  )
}
