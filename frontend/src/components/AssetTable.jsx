import { statusTone } from '../utils/assets'
import { formatDate } from '../utils/format'
import { Badge } from './ui/Badge'

const TH = 'border-b border-line px-3 py-2.5 text-left text-xs font-semibold whitespace-nowrap text-subink'
const TD = 'border-b border-line px-3 py-3 align-top text-[13.5px] text-ink group-last:border-b-0'

/**
 * Lista da carteira: tabela a partir de telas médias e cartões no celular.
 * `compact` oculta a data de depósito na tabela, como na visão do autor do protótipo.
 */
export function AssetTable({ assets, compact = false }) {
  return (
    <>
      <ul className="divide-y divide-line md:hidden">
        {assets.map((asset) => (
          <li key={asset.id} className="px-2 py-3.5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[14px] leading-snug font-medium text-ink">{asset.title}</p>
              <Badge tone={statusTone(asset.status)}>{asset.status}</Badge>
            </div>
            <p className="mt-1 text-xs text-subink">{asset.authors}</p>
            <p className="mt-2 text-xs text-subink tabular-nums">
              {asset.asset_type} · {asset.process_number} · {formatDate(asset.deposit_date)}
            </p>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={TH}>Título</th>
              <th className={TH}>Natureza</th>
              <th className={TH}>Processo</th>
              {!compact && <th className={TH}>Depósito</th>}
              <th className={TH}>Situação</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.id} className="group hover:bg-canvas">
                <td className={TD}>
                  <p className="font-medium">{asset.title}</p>
                  <p className="mt-0.5 text-xs text-subink">{asset.authors}</p>
                </td>
                <td className={`${TD} whitespace-nowrap`}>{asset.asset_type}</td>
                <td className={`${TD} whitespace-nowrap tabular-nums`}>{asset.process_number}</td>
                {!compact && <td className={`${TD} whitespace-nowrap tabular-nums`}>{formatDate(asset.deposit_date)}</td>}
                <td className={TD}>
                  <Badge tone={statusTone(asset.status)}>{asset.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
