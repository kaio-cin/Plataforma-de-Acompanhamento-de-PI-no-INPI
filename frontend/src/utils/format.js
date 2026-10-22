const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

/**
 * Formata uma data ISO "AAAA-MM-DD" como "12 mar 2023", no padrão do protótipo.
 * Não usa `new Date()`: ele interpretaria a string em UTC e, no fuso do Brasil,
 * mostraria o dia anterior.
 */
export function formatDate(isoDate) {
  if (!isoDate) return '—'
  const [year, month, day] = isoDate.split('-')
  return `${day} ${MONTHS[Number(month) - 1]} ${year}`
}

/** Data de hoje no formato "AAAA-MM-DD", no fuso local (para o atributo max do input date). */
export function todayIso() {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

export const ROLE_LABELS = {
  NIT: 'Equipe do NIT',
  AUTOR: 'Inventor(a)',
}

/**
 * Nome de exibição derivado do e-mail ("fernanda.costa@..." → "Fernanda Costa").
 * Quando não há separador no endereço, mostra o próprio e-mail.
 */
export function displayName(email = '') {
  const local = email.split('@')[0]
  if (!/[._-]/.test(local)) return email
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

/** Iniciais para o avatar: "Fernanda Costa" → "FC"; "nit@instituicao.edu.br" → "NI". */
export function initials(name = '') {
  const words = name.split('@')[0].split(/[\s._-]+/).filter(Boolean)
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  return (words[0] ?? '?').slice(0, 2).toUpperCase()
}

/** Primeiro nome para saudações ("Fernanda Costa" → "Fernanda"). */
export function firstName(email = '') {
  const name = displayName(email)
  return name.includes('@') ? '' : name.split(' ')[0]
}
