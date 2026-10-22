import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
  test: {
    // Testes unitários ficam junto do código (src/**/*.test.js);
    // os testes ponta a ponta (e2e/) rodam pelo Playwright.
    include: ['src/**/*.test.{js,jsx}'],
    environment: 'node',
  },
})
