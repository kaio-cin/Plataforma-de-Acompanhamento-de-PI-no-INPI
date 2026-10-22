const TONES = {
  info: 'bg-navy-light text-navy-dark',
  alert: 'bg-amber-light text-amber',
  action: 'bg-danger-light text-danger',
  ok: 'bg-teal-light text-teal',
}

export function Badge({ tone = 'info', children }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${TONES[tone]}`}>
      {children}
    </span>
  )
}
