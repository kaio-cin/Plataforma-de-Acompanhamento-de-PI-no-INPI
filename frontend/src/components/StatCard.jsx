import { Badge } from './ui/Badge'
import { Icon } from './ui/Icon'

const DELTA_TONES = {
  critical: 'text-critical',
  success: 'text-success',
  warning: 'text-warning',
}

/** Indicador da carteira: rótulo em badge, ícone, valor grande e linha de contexto. */
export function StatCard({ label, tone = 'primary', icon, value, delta, deltaTone, loading = false }) {
  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-lg border border-line bg-surface px-6 pt-5 pb-6 shadow-card">
      <div className="flex items-center justify-between gap-2 text-ink-subtle">
        <Badge tone={tone}>{label}</Badge>
        {icon && <Icon name={icon} />}
      </div>
      {loading ? (
        <div className="h-10 w-16 animate-pulse rounded-sm bg-surface-muted" aria-hidden />
      ) : (
        <p className="type-kpi text-ink">{value}</p>
      )}
      {delta && (
        <span className={`text-[13px] leading-[18px] font-semibold ${DELTA_TONES[deltaTone] ?? 'text-ink-muted'}`}>{delta}</span>
      )}
    </div>
  )
}
