export function PageHeader({ eyebrow, title, subtitle, actions, size = 'title' }) {
  return (
    <header className="flex flex-wrap items-end gap-5">
      <div className="min-w-0 flex-1 basis-80">
        {eyebrow && <p className="mb-2 type-eyebrow text-primary-ink">{eyebrow}</p>}
        <h1 className={`text-ink ${size === 'display' ? 'type-display' : 'type-title'}`}>{title}</h1>
        {subtitle && <p className="mt-2 type-body text-ink-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-none flex-wrap gap-2">{actions}</div>}
    </header>
  )
}
