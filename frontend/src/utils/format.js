/**
 * Formata uma data ISO "AAAA-MM-DD" como "DD/MM/AAAA".
 * Não usa `new Date()`: ele interpreta a string em UTC e, no fuso do Brasil,
 * mostraria o dia anterior.
 */
export function formatDate(isoDate) {
  if (!isoDate) return '—'
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}

/** Data de hoje no formato "AAAA-MM-DD", no fuso local (para o atributo max do input date). */
export function todayIso() {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

export const ROLE_LABELS = {
  NIT: 'Equipe do NIT',
  AUTOR: 'Autor / Inventor',
}
