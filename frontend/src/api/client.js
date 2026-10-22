/**
 * Cliente HTTP da aplicação, baseado na Fetch API.
 * Centraliza URL base, token de autenticação e tratamento de erros da API.
 */

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api').replace(/\/$/, '')

const TOKEN_KEY = 'pi-inpi.token'

export const tokenStorage = {
  get() {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },
  set(token) {
    try {
      localStorage.setItem(TOKEN_KEY, token)
    } catch {
      /* armazenamento indisponível (ex.: modo privado): a sessão dura só esta aba */
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch {
      /* idem */
    }
  },
}

/** Erro de API com status HTTP, mensagem amigável e erros por campo (quando houver). */
export class ApiError extends Error {
  constructor(status, message, fieldErrors = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

// Ouvintes notificados quando a API responde 401 (sessão expirada ou inválida).
const unauthorizedListeners = new Set()

export function onUnauthorized(listener) {
  unauthorizedListeners.add(listener)
  return () => unauthorizedListeners.delete(listener)
}

/**
 * Converte o corpo de erro do FastAPI em mensagem + erros por campo.
 * - HTTPException: { detail: "texto" }
 * - Validação Pydantic (422): { detail: [{ loc: ["body", "campo"], msg: "..." }] }
 */
function parseErrorBody(status, body) {
  const detail = body?.detail

  if (typeof detail === 'string') {
    return new ApiError(status, detail)
  }

  if (Array.isArray(detail)) {
    const fieldErrors = {}
    for (const item of detail) {
      const field = item.loc?.[item.loc.length - 1]
      if (typeof field === 'string' && !fieldErrors[field]) {
        fieldErrors[field] = item.msg?.replace(/^Value error, /, '') ?? 'Valor inválido.'
      }
    }
    return new ApiError(status, 'Revise os campos destacados.', fieldErrors)
  }

  return new ApiError(status, 'Não foi possível concluir a operação. Tente novamente.')
}

export async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const token = auth ? tokenStorage.get() : null
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'Não foi possível conectar ao servidor. Verifique se a API está em execução.')
  }

  const data = response.status === 204 ? null : await response.json().catch(() => null)

  if (!response.ok) {
    if (response.status === 401 && auth) {
      unauthorizedListeners.forEach((listener) => listener())
    }
    throw parseErrorBody(response.status, data)
  }

  return data
}
