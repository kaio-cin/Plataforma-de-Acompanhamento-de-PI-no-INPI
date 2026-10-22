import { Button } from './ui/Button'
import { Icon } from './ui/Icon'
import { Spinner } from './ui/Spinner'

/** Estados de uma lista carregada da API: carregando, erro (com nova tentativa) e vazio. */
export function ListState({ loading, error, onRetry, empty }) {
  if (loading) {
    return (
      <div className="flex justify-center px-6 py-14">
        <Spinner label="Carregando ativos…" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
        <Icon name="alerta" size={28} className="text-critical" />
        <p className="type-body-sm text-critical">{error}</p>
        <Button size="sm" icon="atualizar" onClick={onRetry}>
          Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="px-6 py-12 text-center text-ink-subtle">
      <Icon name={empty.icon ?? 'busca'} size={28} />
      <p className="mt-2 mb-1 type-heading text-ink">{empty.title}</p>
      <p className="type-body-sm text-ink-muted">{empty.description}</p>
      {empty.action && <div className="mt-4">{empty.action}</div>}
    </div>
  )
}
