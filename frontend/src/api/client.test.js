import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiError, onUnauthorized, request, tokenStorage } from './client'

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

beforeEach(() => {
  // localStorage em memória (os testes rodam em Node, sem navegador).
  const store = new Map()
  vi.stubGlobal('localStorage', {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('request', () => {
  it('envia o token JWT salvo e o corpo em JSON', async () => {
    tokenStorage.set('abc.def.ghi')
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(201, { id: 1 }))
    vi.stubGlobal('fetch', fetchMock)

    const data = await request('/assets/', { method: 'POST', body: { title: 'X' } })

    expect(data).toEqual({ id: 1 })
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toMatch(/\/api\/assets\/$/)
    expect(options.headers.Authorization).toBe('Bearer abc.def.ghi')
    expect(options.headers['Content-Type']).toBe('application/json')
    expect(JSON.parse(options.body)).toEqual({ title: 'X' })
  })

  it('não envia token em rotas públicas (auth: false)', async () => {
    tokenStorage.set('abc')
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, {}))
    vi.stubGlobal('fetch', fetchMock)

    await request('/auth/login', { method: 'POST', body: {}, auth: false })

    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined()
  })

  it('transforma o detail do FastAPI em mensagem (409)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(409, { detail: 'Processo já cadastrado.' })))

    const error = await request('/assets/').catch((err) => err)

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(409)
    expect(error.message).toBe('Processo já cadastrado.')
  })

  it('mapeia erros de validação do Pydantic (422) para cada campo', async () => {
    const detail = [
      { loc: ['body', 'deposit_date'], msg: 'Value error, A data de depósito não pode estar no futuro.' },
      { loc: ['body', 'asset_type'], msg: "Input should be 'Patente' or 'Programa de Computador'" },
    ]
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(422, { detail })))

    const error = await request('/assets/').catch((err) => err)

    expect(error.status).toBe(422)
    expect(error.message).toBe('Revise os campos destacados.')
    expect(error.fieldErrors).toEqual({
      deposit_date: 'A data de depósito não pode estar no futuro.',
      asset_type: "Input should be 'Patente' or 'Programa de Computador'",
    })
  })

  it('avisa os ouvintes quando a sessão expira (401)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(401, { detail: 'Sessão expirada.' })))
    const listener = vi.fn()
    const unsubscribe = onUnauthorized(listener)

    await request('/assets/').catch(() => {})
    unsubscribe()

    expect(listener).toHaveBeenCalledOnce()
  })

  it('não trata senha errada no login como sessão expirada', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(401, { detail: 'E-mail ou senha incorretos.' })))
    const listener = vi.fn()
    const unsubscribe = onUnauthorized(listener)

    await request('/auth/login', { method: 'POST', body: {}, auth: false }).catch(() => {})
    unsubscribe()

    expect(listener).not.toHaveBeenCalled()
  })

  it('explica quando a API está fora do ar', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    const error = await request('/assets/').catch((err) => err)

    expect(error.status).toBe(0)
    expect(error.message).toMatch(/Não foi possível conectar ao servidor/)
  })
})
