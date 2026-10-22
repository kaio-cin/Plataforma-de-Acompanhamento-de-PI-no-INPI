/** Regras de apresentação dos ativos, compartilhadas entre telas. */

// Valores aceitos pela API (enum AssetType do backend).
export const ASSET_TYPES = ['Patente', 'Programa de Computador']

// Situações sugeridas no cadastro (a API aceita texto livre).
export const ASSET_STATUSES = [
  'Depositado',
  'Em sigilo',
  'Publicado',
  'Em análise',
  'Em exame',
  'Exigência técnica',
  'Deferido',
  'Concedido',
  'Registrado',
  'Indeferido',
  'Arquivado',
]

/**
 * Tom visual da situação, até a leitura da RPI (Step 3) trazer despachos e prazos reais:
 * critical = negativa que exige reação · warning = exige providência do NIT ·
 * success = concluído com êxito · neutral = sem andamento no INPI · info = em tramitação.
 */
export function statusTone(status = '') {
  const value = status.toLowerCase()
  if (value.includes('indefer')) return 'critical'
  if (value.includes('exigência') || value.includes('exigencia')) return 'warning'
  if (/deferid|concedid|registrad/.test(value)) return 'success'
  if (/depositad|sigilo|arquivad/.test(value)) return 'neutral'
  return 'info'
}

export function needsAction(asset) {
  const tone = statusTone(asset.status)
  return tone === 'critical' || tone === 'warning'
}

export function isConcluded(asset) {
  return statusTone(asset.status) === 'success'
}

export function summarizeAssets(assets) {
  return {
    total: assets.length,
    patents: assets.filter((asset) => asset.asset_type === 'Patente').length,
    software: assets.filter((asset) => asset.asset_type === 'Programa de Computador').length,
    needsAction: assets.filter(needsAction).length,
    concluded: assets.filter(isConcluded).length,
  }
}

/** Minúsculas e sem acentos, para buscas tolerantes ("exigencia" encontra "Exigência"). */
export function normalizeText(text = '') {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

export function matchesSearch(asset, query) {
  if (!query.trim()) return true
  const haystack = normalizeText(
    [asset.title, asset.process_number, asset.authors, asset.asset_type, asset.status].join(' '),
  )
  return normalizeText(query.trim())
    .split(/\s+/)
    .every((term) => haystack.includes(term))
}
