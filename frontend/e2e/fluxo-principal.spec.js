// Fluxo ponta a ponta da Etapa 5: login → painel → ativos do banco → cadastro.
import { expect, test } from '@playwright/test'

import { AUTORA, login, logout, NIT, tableRows, uniqueProcessNumber } from './helpers'

test.describe('Autenticação', () => {
  test('sem sessão, qualquer página leva ao login', async ({ page }) => {
    await page.goto('/ativos/novo')
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible()
  })

  test('senha errada mostra mensagem de erro', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('E-mail').fill(NIT.email)
    await page.getByLabel('Senha').fill('senha-errada')
    await page.getByRole('button', { name: 'Entrar', exact: true }).click()

    await expect(page.getByRole('alert')).toHaveText('E-mail ou senha incorretos.')
    await expect(page).toHaveURL(/\/login$/)
  })

  test('a sessão sobrevive ao recarregar e termina ao sair', async ({ page }) => {
    await login(page, NIT)
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Ativos da universidade' })).toBeVisible()

    await logout(page)
    await page.goto('/')
    await expect(page).toHaveURL(/\/login$/)
  })
})

test.describe('Painel do NIT', () => {
  test('mostra indicadores e os ativos vindos da API', async ({ page }) => {
    await login(page, NIT)

    await expect(page.getByRole('heading', { name: 'Ativos da universidade' })).toBeVisible()
    await expect(tableRows(page)).toHaveCount(5)
    const kpis = page.getByRole('region', { name: 'Resumo da carteira' }).locator('p.type-kpi')
    await expect(kpis).toHaveText(['5', '3', '2', '1'])
    await expect(page.getByRole('cell', { name: /Software de gestão acadêmica/ })).toBeVisible()
  })

  test('busca, abas e filtros reduzem a lista', async ({ page }) => {
    await login(page, NIT)
    await expect(tableRows(page)).toHaveCount(5)

    await page.getByRole('searchbox', { name: 'Buscar na carteira' }).fill('irrigacao')
    await expect(tableRows(page)).toHaveCount(1)
    await page.getByRole('button', { name: 'Limpar busca' }).click()

    await page.getByRole('tab', { name: /Exigem ação/ }).click()
    await expect(tableRows(page)).toHaveCount(1)
    await page.getByRole('tab', { name: /Todos/ }).click()

    await page.getByRole('button', { name: 'Patente', exact: true }).click()
    await expect(tableRows(page)).toHaveCount(2)
  })
})

test.describe('Cadastro de ativo', () => {
  test('valida campos obrigatórios e recusa processo duplicado', async ({ page }) => {
    await login(page, NIT)
    await page.getByRole('link', { name: 'Novo ativo' }).click()
    await expect(page).toHaveURL('/ativos/novo')

    await page.getByRole('button', { name: 'Salvar ativo' }).first().click()
    await expect(page.getByRole('alert')).toHaveText('Revise os campos destacados.')
    await expect(page.locator('[aria-invalid="true"]')).toHaveCount(4)

    await page.getByLabel('Título').fill('Teste de processo duplicado')
    await page.getByLabel('Número do processo').fill('BR 10 2023 001234-5')
    await page.getByLabel('Data de depósito').fill('2024-05-10')
    await page.getByLabel(/^Inventores \/ autores/).fill('Fulano de Tal')
    await page.getByRole('button', { name: 'Salvar ativo' }).first().click()

    await expect(page.getByText('Já existe um ativo cadastrado com o processo BR 10 2023 001234-5.')).toBeVisible()
    await expect(page).toHaveURL('/ativos/novo')
  })

  test('ativo cadastrado aparece no painel e para a autora vinculada', async ({ page }) => {
    const processNumber = uniqueProcessNumber()
    const title = `Kit didático de robótica ${processNumber.slice(-8)}`

    await login(page, NIT)
    await page.getByRole('link', { name: 'Novo ativo' }).click()
    await page.getByLabel('Natureza do ativo').selectOption('Programa de Computador')
    await page.getByLabel('Número do processo').fill(processNumber.toLowerCase())
    await page.getByLabel('Título').fill(title)
    await page.getByLabel('Data de depósito').fill('2025-06-10')
    await page.getByLabel('Situação atual').selectOption('Em exame')
    await page.getByLabel(/^Inventores \/ autores/).fill('Kaio Ruan, Fernanda Lima Costa')
    await page.getByLabel('Autor com acesso de acompanhamento').fill(AUTORA.email)
    await page.getByRole('button', { name: 'Salvar ativo' }).first().click()

    // Volta ao painel com aviso de sucesso e o ativo no topo da lista.
    await expect(page).toHaveURL('/')
    await expect(page.getByText(`Ativo ${title} cadastrado com sucesso.`)).toBeVisible()
    await expect(tableRows(page)).toHaveCount(6)
    await expect(tableRows(page).first()).toContainText(title)
    await expect(tableRows(page).first()).toContainText(processNumber) // normalizado em maiúsculas

    // A autora vinculada passa a ver o processo em "Meus ativos".
    await logout(page)
    await login(page, AUTORA)
    await expect(page.getByRole('heading', { name: title })).toBeVisible()
  })
})

test.describe('Visão do inventor (AUTOR)', () => {
  test('vê só os próprios processos e não acessa o cadastro', async ({ page }) => {
    await login(page, AUTORA)

    await expect(page.getByRole('heading', { name: 'Olá, Fernanda' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Sistema de irrigação automatizada por sensores' })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Software de gestão acadêmica/ })).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Novo ativo' })).toHaveCount(0)

    await page.goto('/ativos/novo')
    await expect(page).toHaveURL('/')
  })
})
