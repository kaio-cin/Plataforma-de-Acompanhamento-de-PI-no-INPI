/** Regras de apresentação dos ativos, compartilhadas entre telas. */

export const ASSET_TYPES = ['Patente', 'Programa de Computador']

// Situações sugeridas no cadastro (a API aceita texto livre).
export const ASSET_STATUSES = ['Em análise', 'Em exame', 'Exigência técnica', 'Deferida', 'Registrado']

/**
 * Tom visual da situação, até a leitura da RPI (Step 3) trazer os alertas reais:
 * - action: exige providência do NIT
 * - ok: processo concluído com sucesso
 * - info: em andamento, sem ação necessária
 */
export function statusTone(status) {
  const value = status.toLowerCase()
  if (value.includes('exigência') || value.includes('indefer')) return 'action'
  if (value.includes('deferid') || value.includes('registrad') || value.includes('concedid')) return 'ok'
  return 'info'
}

export function summarizeAssets(assets) {
  return {
    total: assets.length,
    patents: assets.filter((asset) => asset.asset_type === 'Patente').length,
    software: assets.filter((asset) => asset.asset_type === 'Programa de Computador').length,
    needsAction: assets.filter((asset) => statusTone(asset.status) === 'action').length,
  }
}
