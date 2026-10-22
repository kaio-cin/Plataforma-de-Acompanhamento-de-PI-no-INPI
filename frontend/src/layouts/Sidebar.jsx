import { NavLink } from 'react-router-dom'

import { Icon } from '../components/ui/Icon'
import { APP_NAME, INSTITUTION_SHORT } from '../config'

// Itens com `soon` seguem a arquitetura de informação do protótipo, mas dependem
// de etapas futuras (leitura da RPI, calendário de prazos, tarefas, relatórios).
const NAV_BY_ROLE = {
  NIT: {
    section: 'Acompanhamento',
    items: [
      { to: '/', label: 'Carteira de ativos', icon: 'carteira', end: true },
      { label: 'Alertas', icon: 'sino', soon: true },
      { label: 'Calendário', icon: 'calendario', soon: true },
      { label: 'Tarefas', icon: 'tarefa', soon: true },
      { label: 'Relatórios', icon: 'relatorio', soon: true },
      { label: 'Glossário de despachos', icon: 'glossario', soon: true },
    ],
  },
  AUTOR: {
    section: 'Inventor(a)',
    items: [
      { to: '/', label: 'Meus ativos', icon: 'invencao', end: true },
      { label: 'Alertas', icon: 'sino', soon: true },
      { label: 'Calendário', icon: 'calendario', soon: true },
      { label: 'Glossário de despachos', icon: 'glossario', soon: true },
    ],
  },
}

const ITEM = 'flex h-11 flex-none items-center gap-3 rounded-md px-3 text-sm font-semibold'
const SECTION = 'px-3 pt-4 pb-1 text-[11px] font-bold tracking-[0.12em] uppercase opacity-85'

export function Sidebar({ role, onNavigate }) {
  const { section, items } = NAV_BY_ROLE[role] ?? NAV_BY_ROLE.AUTOR

  return (
    <nav aria-label="Navegação principal" className="flex h-full flex-col gap-2 overflow-y-auto bg-navy px-4 py-5 text-nav-ink">
      <BrandMark subtitle={`NIT · ${INSTITUTION_SHORT}`} />

      <p className={SECTION}>{section}</p>
      {items
        .filter((item) => !item.soon)
        .map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `${ITEM} transition-colors hover:bg-navy-active hover:text-nav-ink-active ${isActive ? 'bg-navy-active text-nav-ink-active' : ''}`
            }
          >
            <Icon name={item.icon} />
            {item.label}
          </NavLink>
        ))}

      <p className={SECTION}>Em breve</p>
      {items
        .filter((item) => item.soon)
        .map((item) => (
          <span
            key={item.label}
            className={`${ITEM} cursor-default opacity-55`}
            title="Disponível em uma próxima etapa"
            aria-disabled="true"
          >
            <Icon name={item.icon} />
            {item.label}
          </span>
        ))}

      <div className="mt-auto rounded-lg bg-navy-active p-4 text-xs leading-[18px] font-semibold">
        <strong className="mb-0.5 block text-[13px] text-nav-ink-active">Coleta automática da RPI</strong>
        A leitura semanal dos XMLs do INPI chega em uma próxima etapa.
      </div>
    </nav>
  )
}

/** Marca do produto, usada na barra lateral e no login. */
export function BrandMark({ subtitle }) {
  return (
    <div className="flex items-center gap-3 px-2 pb-5">
      <span className="flex size-10 items-center justify-center rounded-md bg-nav-ink-active text-[15px] font-extrabold tracking-tight text-navy">
        R
      </span>
      <div>
        <div className="text-base leading-5 font-extrabold tracking-tight text-nav-ink-active">{APP_NAME}</div>
        <div className="text-xs leading-4 font-semibold text-nav-ink">{subtitle}</div>
      </div>
    </div>
  )
}
