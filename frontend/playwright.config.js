// Testes ponta a ponta: sobe a API e o frontend em portas próprias, com um banco
// SQLite separado (backend/e2e.db), para não mexer nos dados de desenvolvimento.
//
//   npx playwright install chromium   (uma vez)
//   npm run test:e2e

import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig, devices } from '@playwright/test'

const here = path.dirname(fileURLToPath(import.meta.url))
const backendDir = path.resolve(here, '../backend')

const API_PORT = 8001
const WEB_PORT = 5174
const API_URL = `http://localhost:${API_PORT}`
const WEB_URL = `http://localhost:${WEB_PORT}`

// Python do ambiente virtual do backend (Windows ou Linux/macOS); sem .venv, usa o do PATH.
const venvPython =
  process.platform === 'win32'
    ? path.join(backendDir, '.venv', 'Scripts', 'python.exe')
    : path.join(backendDir, '.venv', 'bin', 'python')
const python = existsSync(venvPython) ? `"${venvPython}"` : 'python'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1, // os cenários compartilham o mesmo banco
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  timeout: 30_000,
  use: {
    baseURL: WEB_URL,
    locale: 'pt-BR',
    timezoneId: 'America/Fortaleza',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Permite usar um Chromium já instalado (ex.: em ambientes sem download de navegadores).
        launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
          ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
          : {},
      },
    },
  ],
  webServer: [
    {
      // Recria o banco de testes com os dados de demonstração e sobe a API.
      command: `${python} -m app.seed --reset && ${python} -m uvicorn app.main:app --port ${API_PORT}`,
      cwd: backendDir,
      url: `${API_URL}/api/health`,
      env: {
        DATABASE_URL: 'sqlite:///./e2e.db',
        CORS_ORIGINS: WEB_URL,
        PYTHONIOENCODING: 'utf-8',
      },
      reuseExistingServer: false,
      timeout: 60_000,
    },
    {
      command: `npx vite --port ${WEB_PORT} --strictPort`,
      cwd: here,
      url: WEB_URL,
      env: { VITE_API_URL: `${API_URL}/api` },
      reuseExistingServer: false,
      timeout: 60_000,
    },
  ],
})
