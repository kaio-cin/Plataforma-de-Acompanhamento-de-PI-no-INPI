import { describe, expect, it, vi } from 'vitest'

import { displayName, firstName, formatDate, initials, todayIso } from './format'

describe('formatDate', () => {
  it('formata no padrão do protótipo', () => {
    expect(formatDate('2023-03-12')).toBe('12 mar 2023')
    expect(formatDate('2024-12-01')).toBe('01 dez 2024')
  })

  it('não volta um dia por causa do fuso horário (bug comum com new Date)', () => {
    expect(formatDate('2025-01-01')).toBe('01 jan 2025')
  })

  it('mostra travessão quando não há data', () => {
    expect(formatDate(null)).toBe('—')
    expect(formatDate('')).toBe('—')
  })
})

describe('todayIso', () => {
  it('usa a data local no formato AAAA-MM-DD', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 5, 23, 30)) // 5 out 2026, 23h30 local
    expect(todayIso()).toBe('2026-10-05')
    vi.useRealTimers()
  })
})

describe('nomes a partir do e-mail', () => {
  it('deriva o nome quando o e-mail tem separador', () => {
    expect(displayName('fernanda.costa@instituicao.edu.br')).toBe('Fernanda Costa')
    expect(displayName('joao_pedro-silva@x.br')).toBe('Joao Pedro Silva')
  })

  it('mostra o próprio e-mail quando não dá para deduzir um nome', () => {
    expect(displayName('nit@instituicao.edu.br')).toBe('nit@instituicao.edu.br')
  })

  it('gera iniciais para o avatar', () => {
    expect(initials('Fernanda Costa')).toBe('FC')
    expect(initials('nit@instituicao.edu.br')).toBe('NI')
    expect(initials('')).toBe('?')
  })

  it('extrai o primeiro nome para a saudação', () => {
    expect(firstName('fernanda.costa@instituicao.edu.br')).toBe('Fernanda')
    expect(firstName('nit@instituicao.edu.br')).toBe('')
  })
})
