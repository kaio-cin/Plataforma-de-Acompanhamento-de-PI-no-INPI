const TONES = {
  neutral: 'bg-surface-muted text-ink-muted',
  primary: 'bg-primary-soft text-primary-ink',
  critical: 'bg-critical-soft text-critical',
  warning: 'bg-warning-soft text-warning',
  info: 'bg-info-soft text-info',
  success: 'bg-success-soft text-success',
}

export function Badge({ tone = 'neutral', dot = false, className = '', children }) {
  return (
    <span
      className={`inline-flex h-[26px] items-center gap-1.5 rounded-full px-2.5 text-xs leading-4 font-bold whitespace-nowrap ${TONES[tone] ?? TONES.neutral} ${className}`}
    >
      {dot && <span className="size-[7px] rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  )
}
