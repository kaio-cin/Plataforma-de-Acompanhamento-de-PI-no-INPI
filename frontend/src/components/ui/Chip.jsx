import { Icon } from './Icon'

/** Filtro liga/desliga, controlado pelo componente pai. */
export function Chip({ on, onChange, children }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => onChange(!on)}
      className={`inline-flex h-[34px] items-center gap-1.5 rounded-full border px-3 text-[13px] font-semibold transition-colors ${
        on ? 'border-transparent bg-primary-soft text-primary-ink' : 'border-line bg-surface text-ink-muted hover:text-ink'
      }`}
    >
      {on && <Icon name="check" size={14} />}
      {children}
    </button>
  )
}
