import { Badge } from './Badge'
import { Icon } from './Icon'

/**
 * Cartão do design system. Com `title`, ganha cabeçalho (ícone, contagem e ação opcionais).
 * `flush` remove o recuo lateral do corpo, para tabelas e listas de borda a borda.
 */
export function Card({ title, icon, count, countTone = 'neutral', action, flush = false, className = '', children }) {
  const hasHead = title || action || count != null

  return (
    <section className={`min-w-0 rounded-lg border border-line bg-surface shadow-card ${className}`}>
      {hasHead && (
        <div className="flex items-center gap-3 px-6 pt-5">
          {icon && <Icon name={icon} className="text-ink-subtle" />}
          <h2 className="flex-1 type-heading text-ink">{title}</h2>
          {count != null && <Badge tone={countTone}>{count}</Badge>}
          {action}
        </div>
      )}
      <div className={flush ? 'pt-4 pb-2' : 'px-6 pt-5 pb-6'}>{children}</div>
    </section>
  )
}
