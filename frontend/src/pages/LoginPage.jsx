import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'

import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { TextField } from '../components/ui/Field'
import { useAuth } from '../hooks/useAuth'

// Contas criadas por `python -m app.seed`; o atalho só aparece em desenvolvimento.
const DEMO_ACCOUNTS = [
  { label: 'NIT', email: 'nit@instituicao.edu.br', password: 'nit12345' },
  { label: 'Autora', email: 'fernanda.costa@instituicao.edu.br', password: 'autor12345' },
]

export function LoginPage() {
  const { status, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from?.pathname ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  if (status === 'authenticated') {
    return <Navigate to={redirectTo} replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email.trim(), password)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      <main className="flex items-center justify-center px-6 py-16 sm:px-14">
        <div className="w-full max-w-sm">
          <p className="text-sm font-semibold tracking-wide text-teal">SISTEMA DE ACOMPANHAMENTO DE PI</p>
          <h1 className="mt-2.5 font-serif text-3xl font-semibold text-navy-dark">Entrar na plataforma</h1>
          <p className="mt-1.5 mb-8 leading-relaxed text-subink">
            Acompanhe patentes e programas de computador depositados no INPI, sem depender de consulta manual às
            publicações.
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {error && <Alert tone="error">{error}</Alert>}

            <TextField
              label="E-mail institucional"
              type="email"
              name="email"
              autoComplete="username"
              placeholder="nome@instituicao.edu.br"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoFocus
            />
            <TextField
              label="Senha"
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            <Button type="submit" loading={submitting} disabled={!email || !password} className="w-full">
              {submitting ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>

          <p className="mt-6 text-xs leading-relaxed text-subink">
            O perfil de acesso (equipe do NIT ou autor) é identificado automaticamente pelo seu e-mail.
          </p>

          {import.meta.env.DEV && (
            <div className="mt-8 rounded-lg border border-dashed border-line p-3">
              <p className="mb-2 text-xs font-medium text-subink">Ambiente de desenvolvimento · contas de teste</p>
              <div className="flex flex-wrap gap-2">
                {DEMO_ACCOUNTS.map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => {
                      setEmail(account.email)
                      setPassword(account.password)
                      setError(null)
                    }}
                    className="rounded-md bg-canvas px-2.5 py-1 text-xs text-navy-dark hover:bg-navy-light"
                  >
                    Preencher como {account.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <aside className="relative hidden flex-col justify-center overflow-hidden bg-navy-dark px-14 py-16 text-white lg:flex">
        <div className="absolute -top-16 -left-16 size-85 rounded-full bg-amber opacity-20 blur-[60px]" aria-hidden />
        <div className="absolute -right-20 -bottom-24 size-85 rounded-full bg-teal opacity-25 blur-[60px]" aria-hidden />
        <blockquote className="relative max-w-md font-serif text-2xl leading-snug">
          “Lentidão e burocracia excessiva” — o maior problema do processo manual hoje.
        </blockquote>
        <p className="relative mt-4 max-w-sm text-[14.5px] leading-relaxed text-white/65">
          A plataforma substitui a consulta manual periódica ao site do INPI por coleta automática das publicações da
          RPI, com alertas quando houver despacho relevante.
        </p>
      </aside>
    </div>
  )
}
