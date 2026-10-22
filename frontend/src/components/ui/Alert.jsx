const TONES = {
  error: 'border-danger/25 bg-danger-light text-danger',
  success: 'border-teal/25 bg-teal-light text-teal',
  info: 'border-navy/15 bg-navy-light text-navy-dark',
}

export function Alert({ tone = 'info', children, onClose, className = '' }) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${TONES[tone]} ${className}`}
    >
      <div className="flex-1">{children}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="-my-0.5 rounded px-1 text-base leading-none opacity-70 hover:opacity-100"
          aria-label="Fechar aviso"
        >
          ×
        </button>
      )}
    </div>
  )
}
