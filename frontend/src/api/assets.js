import { request } from './client'

/** GET /assets/ — NIT recebe a carteira completa; AUTOR, só os próprios ativos */
export function listAssets() {
  return request('/assets/')
}

/** POST /assets/ — cadastra um ativo (apenas NIT) */
export function createAsset(asset) {
  return request('/assets/', { method: 'POST', body: asset })
}
