import { useCallback, useState } from 'react'

const STORAGE_KEY = 'radar-inpi.theme'

function currentTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
}

/** Tema claro/escuro: aplicado no <html> e lembrado neste navegador. */
export function useTheme() {
  const [theme, setTheme] = useState(currentTheme)

  const toggleTheme = useCallback(() => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* sem armazenamento: o tema vale só nesta aba */
    }
    setTheme(next)
  }, [])

  return { theme, toggleTheme }
}
