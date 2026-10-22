import { useEffect, useRef } from 'react'

import { Icon } from '../components/ui/Icon'
import { UserMenu } from './UserMenu'

/** Barra superior: menu (mobile), busca na carteira e usuário. */
export function Topbar({ search, onSearchChange, onOpenMenu }) {
  const inputRef = useRef(null)

  // Atalho "/" foca a busca, como indicado no campo.
  useEffect(() => {
    function handleKey(event) {
      const target = event.target
      const typing = target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
      if (event.key === '/' && !typing) {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <header className="flex h-[76px] items-center gap-3 border-b border-line bg-surface px-4 sm:px-6 lg:px-10">
      <button
        type="button"
        onClick={onOpenMenu}
        className="inline-flex size-[42px] flex-none items-center justify-center rounded-md border border-line text-ink-muted hover:bg-surface-muted lg:hidden"
        aria-label="Abrir menu"
      >
        <Icon name="menu" />
      </button>

      <div className="flex h-11 w-full max-w-[480px] min-w-0 items-center gap-2 rounded-md border border-line bg-canvas px-4 text-ink-subtle focus-within:border-focus focus-within:shadow-[0_0_0_3px_var(--primary-soft)]">
        <Icon name="busca" size={18} />
        <input
          ref={inputRef}
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar processos, títulos, inventores…"
          aria-label="Buscar na carteira"
          className="min-w-0 flex-1 bg-transparent text-sm font-medium text-ink outline-none placeholder:text-ink-subtle"
        />
        <kbd className="hidden rounded-[6px] border border-line bg-surface px-1.5 py-0.5 font-mono text-[11px] text-ink-subtle sm:inline">
          /
        </kbd>
      </div>

      <span className="flex-1" />
      <UserMenu />
    </header>
  )
}
