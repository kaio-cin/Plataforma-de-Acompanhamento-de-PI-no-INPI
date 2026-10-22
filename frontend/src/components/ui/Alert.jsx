import { Icon } from './Icon'

const TONES = {
  error: { classes: 'bg-critical-soft text-critical', icon: 'alerta' },
  success: { classes: 'bg-success-soft text-success', icon: 'ok' },
  info: { classes: 'bg-primary-soft text-primary-ink', icon: 'documento' },
}

export function Alert({ tone = 'info', children, onClose, className = '' }) {
  const { classes, icon } = TONES[tone]

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-md px-4 py-3 type-body-sm font-semibold ${classes} ${className}`}
    >
      <Icon name={icon} size={18} className="mt-px" />
      <div className="flex-1">{children}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="-m-1 rounded-sm p-1 opacity-70 hover:opacity-100"
          aria-label="Fechar aviso"
        >
          <Icon name="fechar" size={16} />
        </button>
      )}
    </div>
  )
}
