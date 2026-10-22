import { describe, expect, it } from 'vitest'

import { matchesSearch, needsAction, normalizeText, statusTone, summarizeAssets } from './assets'

const asset = (overrides = {}) => ({
  title: 'Sistema de irrigação automatizada por sensores',
  process_number: 'BR 10 2023 001234-5',
  authors: 'Fernanda Lima Costa, Rodrigo A. Nascimento',
  asset_type: 'Patente',
  status: 'Em exame',
  ...overrides,
})

describe('statusTone', () => {
  it.each([
    ['Exigência técnica', 'warning'],
    ['Indeferido', 'critical'],
    ['Deferida', 'success'],
    ['Concedido', 'success'],
    ['Registrado', 'success'],
    ['Depositado', 'neutral'],
    ['Em sigilo', 'neutral'],
    ['Em exame', 'info'],
    ['Publicado', 'info'],
  ])('"%s" → %s', (status, tone) => {
    expect(statusTone(status)).toBe(tone)
  })

  it('não confunde "Indeferido" com "Deferido"', () => {
    expect(statusTone('Indeferido')).not.toBe('success')
  })
})

describe('summarizeAssets', () => {
  it('conta natureza, pendências e concluídos', () => {
    const summary = summarizeAssets([
      asset(),
      asset({ asset_type: 'Programa de Computador', status: 'Registrado' }),
      asset({ status: 'Exigência técnica' }),
      asset({ status: 'Indeferido' }),
    ])

    expect(summary).toEqual({ total: 4, patents: 3, software: 1, needsAction: 2, concluded: 1 })
  })

  it('funciona com a carteira vazia', () => {
    expect(summarizeAssets([])).toEqual({ total: 0, patents: 0, software: 0, needsAction: 0, concluded: 0 })
  })

  it('needsAction cobre exigência e indeferimento', () => {
    expect(needsAction(asset({ status: 'Exigência técnica' }))).toBe(true)
    expect(needsAction(asset({ status: 'Em exame' }))).toBe(false)
  })
})

describe('busca na carteira', () => {
  it('ignora acentos e maiúsculas', () => {
    expect(normalizeText('Irrigação EXIGÊNCIA')).toBe('irrigacao exigencia')
    expect(matchesSearch(asset(), 'IRRIGACAO')).toBe(true)
  })

  it('encontra por número do processo, inventor, natureza ou situação', () => {
    expect(matchesSearch(asset(), '001234')).toBe(true)
    expect(matchesSearch(asset(), 'rodrigo')).toBe(true)
    expect(matchesSearch(asset(), 'patente')).toBe(true)
    expect(matchesSearch(asset(), 'em exame')).toBe(true)
  })

  it('exige todos os termos digitados', () => {
    expect(matchesSearch(asset(), 'irrigação fernanda')).toBe(true)
    expect(matchesSearch(asset(), 'irrigação joão')).toBe(false)
  })

  it('busca vazia mostra tudo', () => {
    expect(matchesSearch(asset(), '   ')).toBe(true)
  })
})
