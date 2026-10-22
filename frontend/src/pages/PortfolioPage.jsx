import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { AssetTable } from '../components/AssetTable'
import { KpiCard } from '../components/KpiCard'
import { PageHeader } from '../components/PageHeader'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Icon } from '../components/ui/Icon'
import { Spinner } from '../components/ui/Spinner'
import { useAssets } from '../hooks/useAssets'
import { useAuth } from '../hooks/useAuth'
import { summarizeAssets } from '../utils/assets'

/** Carteira de ativos: painel do NIT (US06) ou "Meus processos" do autor (US03). */
export function PortfolioPage() {
  const { user } = useAuth()
  const isNit = user.role === 'NIT'
  const { assets, loading, error, reload } = useAssets()

  // Mensagem enviada pelo formulário de cadastro após salvar.
  const location = useLocation()
  const navigate = useNavigate()
  const [flash, setFlash] = useState(location.state?.created ?? null)
  useEffect(() => {
    // Limpa o state do histórico para a mensagem não voltar ao recarregar a página.
    if (location.state?.created) navigate(location.pathname, { replace: true, state: null })
  }, [location, navigate])

  const summary = summarizeAssets(assets)

  return (
    <>
      <PageHeader
        title={isNit ? 'Carteira de ativos' : 'Meus processos'}
        subtitle={
          isNit
            ? 'Visão consolidada dos processos acompanhados pelo NIT'
            : 'Acompanhamento restrito aos processos em que você é inventor/autor'
        }
        actions={
          isNit && (
            <Link
              to="/ativos/novo"
              className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-dark"
            >
              <Icon name="plus" />
              Novo ativo
            </Link>
          )
        }
      />

      {flash && (
        <Alert tone="success" onClose={() => setFlash(null)} className="mb-5">
          Ativo <strong className="font-semibold">{flash}</strong> cadastrado com sucesso.
        </Alert>
      )}

      {isNit && (
        <section aria-label="Resumo da carteira" className="mb-6 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
          <KpiCard label="Ativos cadastrados" value={summary.total} loading={loading} />
          <KpiCard label="Patentes" value={summary.patents} loading={loading} />
          <KpiCard label="Programas de computador" value={summary.software} loading={loading} />
          <KpiCard label="Em exigência" value={summary.needsAction} tone="action" loading={loading} />
        </section>
      )}

      <Card className="p-2 sm:p-3">
        {loading ? (
          <div className="flex justify-center py-14">
            <Spinner label="Carregando ativos…" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
            <p className="text-sm text-danger">{error}</p>
            <Button variant="secondary" onClick={reload}>
              <Icon name="refresh" />
              Tentar novamente
            </Button>
          </div>
        ) : assets.length === 0 ? (
          <EmptyState isNit={isNit} />
        ) : (
          <AssetTable assets={assets} compact={!isNit} />
        )}
      </Card>

      {!isNit && (
        <p className="mt-4 rounded-lg bg-navy-light px-4 py-3 text-[13px] text-navy-dark">
          Este perfil tem apenas visualização — o cadastro e a edição de ativos são feitos pela equipe do NIT.
        </p>
      )}
    </>
  )
}

function EmptyState({ isNit }) {
  return (
    <div className="px-4 py-14 text-center">
      <p className="font-medium text-ink">{isNit ? 'Nenhum ativo cadastrado ainda' : 'Nenhum processo vinculado a você'}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-subink">
        {isNit
          ? 'Cadastre o primeiro processo para começar o acompanhamento.'
          : 'Quando a equipe do NIT vincular seu e-mail a um processo, ele aparecerá aqui.'}
      </p>
      {isNit && (
        <Link to="/ativos/novo" className="mt-4 inline-block text-sm font-semibold text-navy hover:underline">
          Cadastrar ativo
        </Link>
      )}
    </div>
  )
}
