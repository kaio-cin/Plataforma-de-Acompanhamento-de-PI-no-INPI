import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useOutletContext } from 'react-router-dom'

import { AssetTable } from '../components/AssetTable'
import { ListState } from '../components/ListState'
import { PageHeader } from '../components/PageHeader'
import { StatCard } from '../components/StatCard'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Chip } from '../components/ui/Chip'
import { Tabs } from '../components/ui/Tabs'
import { useAssets } from '../hooks/useAssets'
import { isConcluded, matchesSearch, needsAction, summarizeAssets } from '../utils/assets'

const TAB_FILTERS = {
  todos: () => true,
  acao: needsAction,
  tramitacao: (asset) => !needsAction(asset) && !isConcluded(asset),
  concluidos: isConcluded,
}

/** Carteira de ativos do NIT (US06): indicadores, filtros e tabela. */
export function PortfolioPage() {
  const { assets, loading, error, reload } = useAssets()
  const { search, setSearch } = useOutletContext()
  const [tab, setTab] = useState('todos')
  const [types, setTypes] = useState({ Patente: true, 'Programa de Computador': true })

  // Mensagem enviada pelo formulário de cadastro após salvar.
  const location = useLocation()
  const navigate = useNavigate()
  const [flash, setFlash] = useState(location.state?.created ?? null)
  useEffect(() => {
    // Limpa o state do histórico para a mensagem não voltar ao recarregar a página.
    if (location.state?.created) navigate(location.pathname, { replace: true, state: null })
  }, [location, navigate])

  const summary = summarizeAssets(assets)
  const byType = assets.filter((asset) => types[asset.asset_type] !== false)
  const visible = byType.filter(TAB_FILTERS[tab]).filter((asset) => matchesSearch(asset, search))
  const countTab = (id) => byType.filter(TAB_FILTERS[id]).length
  const percent = (part) => (summary.total ? `${Math.round((part / summary.total) * 100)}% da carteira` : '—')

  return (
    <>
      <PageHeader
        eyebrow="Carteira"
        title="Ativos da universidade"
        subtitle={loading ? 'Carregando a carteira…' : `${summary.total} ${summary.total === 1 ? 'ativo monitorado' : 'ativos monitorados'} junto ao INPI`}
        actions={
          <Button as={Link} to="/ativos/novo" variant="primary" icon="mais">
            Novo ativo
          </Button>
        }
      />

      {flash && (
        <Alert tone="success" onClose={() => setFlash(null)}>
          Ativo <strong className="font-bold">{flash}</strong> cadastrado com sucesso.
        </Alert>
      )}

      <section aria-label="Resumo da carteira" className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Ativos monitorados"
          tone="primary"
          icon="carteira"
          value={summary.total}
          delta={`${summary.concluded} ${summary.concluded === 1 ? 'concluído' : 'concluídos'}`}
          loading={loading}
        />
        <StatCard label="Patentes" tone="info" icon="invencao" value={summary.patents} delta={percent(summary.patents)} loading={loading} />
        <StatCard
          label="Programas de computador"
          tone="info"
          icon="software"
          value={summary.software}
          delta={percent(summary.software)}
          loading={loading}
        />
        <StatCard
          label="Exigem ação"
          tone={summary.needsAction ? 'warning' : 'success'}
          icon={summary.needsAction ? 'alerta' : 'ok'}
          value={summary.needsAction}
          delta={summary.needsAction ? 'Exigência ou indeferimento' : 'Nenhuma pendência'}
          deltaTone={summary.needsAction ? 'warning' : 'success'}
          loading={loading}
        />
      </section>

      <Card flush>
        <div className="flex flex-wrap items-center gap-3 px-6 pt-1 pb-4">
          <Tabs
            label="Filtrar por situação"
            active={tab}
            onChange={setTab}
            items={[
              { id: 'todos', label: 'Todos', count: countTab('todos') },
              { id: 'acao', label: 'Exigem ação', count: countTab('acao') },
              { id: 'tramitacao', label: 'Em tramitação', count: countTab('tramitacao') },
              { id: 'concluidos', label: 'Concluídos', count: countTab('concluidos') },
            ]}
          />
          <span className="hidden flex-1 lg:block" />
          <div className="flex flex-wrap gap-2">
            <Chip on={types.Patente} onChange={(on) => setTypes((t) => ({ ...t, Patente: on }))}>
              Patente
            </Chip>
            <Chip
              on={types['Programa de Computador']}
              onChange={(on) => setTypes((t) => ({ ...t, 'Programa de Computador': on }))}
            >
              Programa de computador
            </Chip>
          </div>
        </div>

        {search && (
          <div className="flex flex-wrap items-center gap-3 px-6 pb-3">
            <span className="type-body-sm text-ink-muted">Filtrando por “{search}”</span>
            <Button size="sm" variant="ghost" icon="fechar" onClick={() => setSearch('')}>
              Limpar busca
            </Button>
          </div>
        )}

        {loading || error || visible.length === 0 ? (
          <ListState
            loading={loading}
            error={error}
            onRetry={reload}
            empty={
              assets.length === 0
                ? {
                    icon: 'carteira',
                    title: 'Nenhum ativo cadastrado ainda',
                    description: 'Cadastre o primeiro processo para começar o acompanhamento.',
                    action: (
                      <Button as={Link} to="/ativos/novo" size="sm" variant="primary" icon="mais">
                        Cadastrar ativo
                      </Button>
                    ),
                  }
                : { title: 'Nenhum ativo encontrado', description: 'Revise os filtros ou a busca.' }
            }
          />
        ) : (
          <AssetTable assets={visible} />
        )}

        {!loading && !error && assets.length > 0 && (
          <p className="px-6 pt-4 pb-1 type-body-sm text-ink-muted">
            Mostrando {visible.length} de {assets.length}
          </p>
        )}
      </Card>
    </>
  )
}
