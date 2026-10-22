import { request } from './client'

/** POST /auth/login — retorna { access_token, token_type, user } */
export function login(email, password) {
  return request('/auth/login', { method: 'POST', body: { email, password }, auth: false })
}

/** GET /auth/me — dados do usuário dono do token atual */
export function fetchCurrentUser() {
  return request('/auth/me')
}
