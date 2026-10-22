import { useCallback, useEffect, useMemo, useState } from 'react'

import * as authApi from '../api/auth'
import { onUnauthorized, tokenStorage } from '../api/client'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState(() => (tokenStorage.get() ? 'checking' : 'anonymous'))

  const logout = useCallback(() => {
    tokenStorage.clear()
    setUser(null)
    setStatus('anonymous')
  }, [])

  // Ao abrir a aplicação com um token salvo, confirma com a API se ele ainda é válido.
  useEffect(() => {
    if (status !== 'checking') return
    let cancelled = false
    authApi
      .fetchCurrentUser()
      .then((currentUser) => {
        if (cancelled) return
        setUser(currentUser)
        setStatus('authenticated')
      })
      .catch(() => {
        if (!cancelled) logout()
      })
    return () => {
      cancelled = true
    }
  }, [status, logout])

  // Qualquer resposta 401 da API (token expirado) encerra a sessão.
  useEffect(() => onUnauthorized(logout), [logout])

  const login = useCallback(async (email, password) => {
    const { access_token: token, user: loggedUser } = await authApi.login(email, password)
    tokenStorage.set(token)
    setUser(loggedUser)
    setStatus('authenticated')
    return loggedUser
  }, [])

  const value = useMemo(() => ({ user, status, login, logout }), [user, status, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
