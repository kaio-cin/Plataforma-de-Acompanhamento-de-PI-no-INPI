import { NavLink } from 'react-router-dom'

import { Icon } from '../components/ui/Icon'

// Itens com `soon` fazem parte da arquitetura de informação do protótipo,
// mas dependem de etapas futuras (leitura da RPI, preferências).
const NAV_BY_ROLE = {
  NIT: {
    area: 'Painel do NIT',
    items: [
      { to: '/', label: 'Carteira de ativos', icon: 'folder', end: true },
      { to: '/ativos/novo', label: 'Novo ativo', icon: 'plus' },
      { label: 'Alertas', icon: 'bell', soon: true },
      { label: 'Configurações', icon: 'settings', soon: true },
    ],
  },
  AUTOR: {
    area: 'Área do autor',
    items: [
      { to: '/', label: 'Meus processos', icon: 'folder', end: true },
      { label: 'Configurações', icon: 'settings', soon: true },
    ],
  },
}

const ITEM_CLASSES = 'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] transition-colors'

export function Sidebar({ role, onNavigate }) {
  const { area, items } = NAV_BY_ROLE[role] ?? NAV_BY_ROLE.AUTOR

  return (
    <div className="flex h-full flex-col px-3.5 py-6">
      <div className="px-2 pb-6">
        <p className="font-serif text-[15.5px] leading-tight font-semibold whitespace-nowrap text-navy-dark">
          Acompanhamento de PI
        </p>
        <p className="mt-0.5 text-xs text-subink">{area}</p>
      </div>

      <nav aria-label="Navegação principal" className="space-y-0.5">
        {items.map((item) =>
          item.soon ? (
            <span
              key={item.label}
              className={`${ITEM_CLASSES} cursor-default text-subink/55`}
              title="Disponível em uma próxima etapa"
            >
              <Icon name={item.icon} />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              <span className="shrink-0 rounded bg-canvas px-1.5 py-0.5 text-[9.5px] font-medium tracking-wide whitespace-nowrap uppercase">
                em breve
              </span>
            </span>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `${ITEM_CLASSES} ${isActive ? 'bg-navy-light font-semibold text-navy-dark' : 'text-subink hover:bg-canvas hover:text-ink'}`
              }
            >
              <Icon name={item.icon} />
              {item.label}
            </NavLink>
          ),
        )}
      </nav>
    </div>
  )
}
