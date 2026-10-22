import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'

import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { TextField } from '../components/ui/Field'
import { APP_NAME, INSTITUTION_NAME } from '../config'
import { useAuth } from '../hooks/useAuth'
import { BrandMark } from '../layouts/Sidebar'

// Contas criadas por `python -m app.seed`; os atalhos só aparecem em desenvolvimento.
const DEMO_ACCOUNTS = [
  { label: 'Entrar como NIT', email: 'nit@instituicao.edu.br', password: 'nit12345' },
  { label: 'Entrar como inventora', email: 'fernanda.costa@instituicao.edu.br', password: 'autor12345' },
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

  async function signIn(emailValue, passwordValue) {
    setError(null)
    setSubmitting(true)
    try {
      await login(emailValue.trim(), passwordValue)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    signIn(email, password)
  }

  return (
    <div className="grid min-h-screen bg-canvas lg:grid-cols-2">
      <aside className="hidden flex-col justify-between rounded-r-[32px] bg-navy p-14 text-nav-ink lg:flex">
        <BrandMark subtitle={`NIT · ${INSTITUTION_NAME}`} />
        <div>
          <p className="mb-4 max-w-[460px] type-display text-nav-ink-active">Cada despacho do INPI, no dia em que sai.</p>
          <p className="max-w-[420px] type-body">
            Acompanhe as patentes e os programas de computador da universidade em um só lugar. Em breve, a RPI será lida
            automaticamente toda terça, com alertas de prazo no painel e por e-mail.
          </p>
        </div>
        <p className="type-caption">Núcleo de Inovação Tecnológica · {INSTITUTION_NAME}</p>
      </aside>

      <main className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[420px]">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <span className="flex size-10 items-center justify-center rounded-md bg-navy text-[15px] font-extrabold text-nav-ink-active">
              R
            </span>
            <span className="text-base font-extrabold tracking-tight text-ink">{APP_NAME}</span>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="rounded-xl border border-line bg-surface p-6 shadow-raised sm:p-10"
          >
            <h1 className="mb-2 type-title text-ink">Entrar</h1>
            <p className="mb-7 type-body text-ink-muted">Use seu e-mail institucional e sua senha.</p>

            <div className="flex flex-col gap-[18px]">
              {error && <Alert tone="error">{error}</Alert>}

              <TextField
                label="E-mail"
                type="email"
                name="email"
                icon="email"
                autoComplete="username"
                placeholder="nome@instituicao.edu.br"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoFocus
              />
              <TextField
                label="Senha"
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />

              <Button type="submit" variant="primary" loading={submitting} disabled={!email || !password} className="w-full">
                {submitting ? 'Entrando…' : 'Entrar'}
              </Button>

              <p className="type-caption text-ink-subtle">
                O perfil de acesso (equipe do NIT ou inventor) é identificado automaticamente pelo e-mail.
              </p>

              {import.meta.env.DEV && (
                <div className="border-t border-dashed border-line pt-4">
                  <p className="mb-2 type-caption text-ink-subtle">Ambiente de desenvolvimento · contas de teste</p>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    {DEMO_ACCOUNTS.map((account) => (
                      <Button
                        key={account.email}
                        size="sm"
                        className="flex-1"
                        disabled={submitting}
                        onClick={() => {
                          setEmail(account.email)
                          setPassword(account.password)
                          signIn(account.email, account.password)
                        }}
                      >
                        {account.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
