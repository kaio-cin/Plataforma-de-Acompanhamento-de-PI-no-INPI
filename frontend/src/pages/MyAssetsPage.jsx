import { useOutletContext } from 'react-router-dom'

import { ListState } from '../components/ListState'
import { PageHeader } from '../components/PageHeader'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Icon } from '../components/ui/Icon'
import { INSTITUTION_SHORT } from '../config'
import { useAssets } from '../hooks/useAssets'
import { useAuth } from '../hooks/useAuth'
import { matchesSearch, statusTone } from '../utils/assets'
import { firstName, formatDate } from '../utils/format'

/** "Meus ativos": visão somente leitura do inventor/autor (US03). */
export function MyAssetsPage() {
  const { user } = useAuth()
  const { assets, loading, error, reload } = useAssets()
  const { search, setSearch } = useOutletContext()
  const visible = assets.filter((asset) => matchesSearch(asset, search))
  const name = firstName(user.email)

  return (
    <>
      <PageHeader
        eyebrow="Meus ativos"
        title={name ? `Olá, ${name}` : 'Olá'}
        subtitle={
          loading
            ? 'Carregando seus processos…'
            : `Você está vinculado(a) a ${assets.length} ${assets.length === 1 ? 'ativo' : 'ativos'} da ${INSTITUTION_SHORT} acompanhados pelo NIT.`
        }
      />

      {search && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="type-body-sm text-ink-muted">Filtrando por “{search}”</span>
          <Button size="sm" variant="ghost" icon="fechar" onClick={() => setSearch('')}>
            Limpar busca
          </Button>
        </div>
      )}

      {loading || error || visible.length === 0 ? (
        <Card>
          <ListState
            loading={loading}
            error={error}
            onRetry={reload}
            empty={
              assets.length === 0
                ? {
                    icon: 'invencao',
                    title: 'Nenhum processo vinculado a você',
                    description: 'Quando a equipe do NIT vincular seu e-mail a um processo, ele aparecerá aqui.',
                  }
                : { title: 'Nenhum ativo encontrado', description: 'Revise a busca.' }
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {visible.map((asset) => (
            <Card
              key={asset.id}
              title={asset.title}
              action={
                <Badge tone={statusTone(asset.status)} dot>
                  {asset.status}
                </Badge>
              }
            >
              <div className="flex flex-col gap-3">
                <span className="font-mono text-[13px] font-medium text-ink">{asset.process_number}</span>
                <dl className="grid grid-cols-[112px_1fr] gap-x-4 gap-y-2 text-sm leading-5">
                  <dt className="font-semibold text-ink-subtle">Natureza</dt>
                  <dd className="font-semibold text-ink">{asset.asset_type}</dd>
                  <dt className="font-semibold text-ink-subtle">Depósito</dt>
                  <dd className="font-semibold text-ink">{formatDate(asset.deposit_date)}</dd>
                  <dt className="font-semibold text-ink-subtle">Inventores</dt>
                  <dd className="font-semibold text-ink">{asset.authors}</dd>
                </dl>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="flex items-start gap-3 rounded-md bg-primary-soft px-4 py-3 type-body-sm font-semibold text-primary-ink">
        <Icon name="documento" size={18} className="mt-px" />
        Este perfil tem apenas visualização — o cadastro e a edição de ativos são feitos pela equipe do NIT.
      </div>
    </>
  )
}
