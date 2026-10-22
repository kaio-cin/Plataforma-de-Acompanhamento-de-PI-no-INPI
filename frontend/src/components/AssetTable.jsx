import { statusTone } from '../utils/assets'
import { formatDate } from '../utils/format'
import { Badge } from './ui/Badge'

const TH = 'bg-surface-muted px-4 py-3 text-left text-xs font-bold tracking-[0.02em] whitespace-nowrap text-ink-muted'
const TD = 'border-b border-line px-4 py-4 align-middle text-[13px] leading-5 font-medium text-ink group-last:border-b-0 group-hover:bg-surface-muted'

/** Lista da carteira: tabela a partir de telas médias e cartões no celular. */
export function AssetTable({ assets }) {
  return (
    <>
      <ul className="divide-y divide-line px-5 md:hidden">
        {assets.map((asset) => (
          <li key={asset.id} className="py-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm leading-5 font-bold text-ink">{asset.title}</p>
              <Badge tone={statusTone(asset.status)} dot>
                {asset.status}
              </Badge>
            </div>
            <p className="mt-1 font-mono text-xs text-ink-subtle">{asset.process_number}</p>
            <p className="mt-2 type-caption text-ink-muted">
              {asset.asset_type} · depósito em {formatDate(asset.deposit_date)}
            </p>
            <p className="mt-0.5 type-caption text-ink-subtle">{asset.authors}</p>
          </li>
        ))}
      </ul>

      <div className="mx-3 hidden overflow-x-auto md:block">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr>
              <th className={`${TH} rounded-l-sm pl-6`}>Ativo</th>
              <th className={TH}>Natureza</th>
              <th className={TH}>Inventores / autores</th>
              <th className={TH}>Depósito</th>
              <th className={`${TH} rounded-r-sm pr-6`}>Situação</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.id} className="group">
                <td className={`${TD} pl-6`}>
                  <div className="text-sm font-bold text-ink">{asset.title}</div>
                  <div className="font-mono text-xs text-ink-subtle">{asset.process_number}</div>
                </td>
                <td className={`${TD} whitespace-nowrap`}>{asset.asset_type}</td>
                <td className={`${TD} min-w-48`}>{asset.authors}</td>
                <td className={`${TD} whitespace-nowrap`}>{formatDate(asset.deposit_date)}</td>
                <td className={`${TD} pr-6`}>
                  <Badge tone={statusTone(asset.status)} dot>
                    {asset.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
