/** Abas segmentadas, controladas pelo componente pai. items: [{ id, label, count }] */
export function Tabs({ items, active, onChange, label }) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex max-w-full gap-1 overflow-x-auto rounded-md bg-surface-muted p-1">
      {items.map((item) => {
        const selected = item.id === active
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(item.id)}
            className={`inline-flex h-[34px] items-center gap-2 rounded-sm px-4 text-[13px] font-bold whitespace-nowrap transition-colors ${
              selected ? 'bg-surface text-primary-ink shadow-card' : 'text-ink-muted hover:text-ink'
            }`}
          >
            {item.label}
            {item.count != null && (
              <span
                className={`rounded-full px-[7px] py-px text-[11px] ${selected ? 'bg-primary-soft text-primary-ink' : 'bg-line text-ink-muted'}`}
              >
                {item.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
