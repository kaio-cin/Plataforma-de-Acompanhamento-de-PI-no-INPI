import { Card } from './ui/Card'

export function KpiCard({ label, value, tone = 'default', loading = false }) {
  const valueColor = tone === 'action' && value > 0 ? 'text-danger' : 'text-navy-dark'

  return (
    <Card className="p-4">
      <p className="text-[12.5px] text-subink">{label}</p>
      {loading ? (
        <div className="mt-2.5 h-7 w-12 animate-pulse rounded bg-canvas" aria-hidden />
      ) : (
        <p className={`mt-1 font-serif text-[26px] font-semibold tabular-nums ${valueColor}`}>{value}</p>
      )}
    </Card>
  )
}
