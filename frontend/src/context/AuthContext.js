import { createContext } from 'react'

/**
 * Sessão do usuário.
 * status: 'checking' (validando token salvo) | 'authenticated' | 'anonymous'
 */
export const AuthContext = createContext(null)
