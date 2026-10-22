import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { createAsset } from '../api/assets'
import { PageHeader } from '../components/PageHeader'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { SelectField, TextField } from '../components/ui/Field'
import { ASSET_STATUSES, ASSET_TYPES } from '../utils/assets'
import { todayIso } from '../utils/format'

const INITIAL_FORM = {
  title: '',
  asset_type: ASSET_TYPES[0],
  process_number: '',
  deposit_date: '',
  status: ASSET_STATUSES[0],
  authors: '',
  author_email: '',
}

const REQUIRED_FIELDS = {
  title: 'Informe o título do ativo.',
  process_number: 'Informe o código do processo.',
  deposit_date: 'Informe a data de depósito.',
  authors: 'Informe ao menos um inventor/autor.',
}

/** Validação rápida no navegador; as regras definitivas ficam na API. */
function validate(form) {
  const errors = {}
  for (const [field, message] of Object.entries(REQUIRED_FIELDS)) {
    if (!form[field].trim()) errors[field] = message
  }
  if (form.deposit_date && form.deposit_date > todayIso()) {
    errors.deposit_date = 'A data de depósito não pode estar no futuro.'
  }
  return errors
}

/** Cadastro de novo ativo (US04), com vínculo opcional de autor (US07). */
export function NewAssetPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(INITIAL_FORM)
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  function bind(field) {
    return {
      name: field,
      value: form[field],
      error: fieldErrors[field],
      onChange: (event) => {
        setForm((current) => ({ ...current, [field]: event.target.value }))
        if (fieldErrors[field]) setFieldErrors(({ [field]: _removed, ...rest }) => rest)
      },
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError(null)

    const errors = validate(form)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    try {
      const created = await createAsset({ ...form, author_email: form.author_email.trim() || null })
      navigate('/', { state: { created: created.title } })
    } catch (err) {
      // 409 (processo duplicado) e 422 de regra de negócio vêm como mensagem única;
      // 422 de validação vem com erros por campo.
      if (err.status === 409) {
        setFieldErrors({ process_number: err.message })
      } else if (err.status === 422 && err.message.includes('AUTOR')) {
        setFieldErrors({ author_email: err.message })
      } else {
        setFieldErrors(err.fieldErrors ?? {})
        setFormError(err.message)
      }
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Cadastrar novo ativo"
        subtitle="Informe os dados do processo para começar a monitorá-lo automaticamente"
      />

      <Card className="max-w-3xl p-5 sm:p-6">
        <form onSubmit={handleSubmit} noValidate>
          {formError && (
            <Alert tone="error" className="mb-5">
              {formError}
            </Alert>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Título"
              placeholder="Ex.: Sistema de irrigação automatizada por sensores"
              className="sm:col-span-2"
              maxLength={500}
              autoFocus
              {...bind('title')}
            />
            <SelectField label="Natureza do ativo" options={ASSET_TYPES} {...bind('asset_type')} />
            <TextField
              label="Código do processo"
              placeholder="BR 10 2023 001234-5"
              hint="Número do processo no INPI"
              maxLength={50}
              {...bind('process_number')}
            />
            <TextField label="Data de depósito" type="date" max={todayIso()} {...bind('deposit_date')} />
            <SelectField label="Situação atual" options={ASSET_STATUSES} {...bind('status')} />
            <TextField
              label="Inventores / Autores"
              placeholder="Nomes separados por vírgula"
              className="sm:col-span-2"
              maxLength={1000}
              {...bind('authors')}
            />
            <TextField
              label="Vincular autor com acesso de acompanhamento (opcional)"
              type="email"
              placeholder="autor@instituicao.edu.br"
              hint="O autor precisa ter uma conta com perfil AUTOR. Ele verá este processo em “Meus processos”."
              className="sm:col-span-2"
              {...bind('author_email')}
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-5">
            <Button type="submit" loading={submitting}>
              {submitting ? 'Salvando…' : 'Salvar ativo'}
            </Button>
            <Link to="/" className="rounded-lg px-3 py-2.5 text-sm font-medium text-subink hover:bg-canvas hover:text-ink">
              Cancelar
            </Link>
          </div>
        </form>
      </Card>
    </>
  )
}
