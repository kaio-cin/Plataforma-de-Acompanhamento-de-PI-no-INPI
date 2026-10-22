export function Spinner({ label, className = '' }) {
  return (
    <span role="status" className={`inline-flex items-center gap-2 type-body-sm text-ink-subtle ${className}`}>
      <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
      {label && <span>{label}</span>}
    </span>
  )
}
