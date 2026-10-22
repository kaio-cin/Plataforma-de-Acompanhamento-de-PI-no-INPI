import { expect } from '@playwright/test'

// Contas criadas por `python -m app.seed --reset` (ver playwright.config.js).
export const NIT = { email: 'nit@instituicao.edu.br', password: 'nit12345' }
export const AUTORA = { email: 'fernanda.costa@instituicao.edu.br', password: 'autor12345' }

export async function login(page, { email, password }) {
  await page.goto('/login')
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha').fill(password)
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL('/')
}

export async function logout(page) {
  await page.getByRole('button', { expanded: false, name: /Equipe do NIT|Inventor/ }).click()
  await page.getByRole('menuitem', { name: 'Sair' }).click()
  await expect(page).toHaveURL(/\/login$/)
}

/** Número de processo único por execução, para os testes poderem rodar várias vezes. */
export function uniqueProcessNumber() {
  const digits = String(Date.now()).slice(-6)
  return `BR 10 2026 ${digits}-${digits.at(-1)}`
}

/** Linhas da tabela da carteira (visível em telas médias e grandes). */
export function tableRows(page) {
  return page.locator('table tbody tr')
}
