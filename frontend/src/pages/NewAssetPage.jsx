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
  process_number: 'Informe o número do processo.',
  deposit_date: 'Informe a data de depósito.',
  authors: 'Informe ao menos um inventor/autor.',
}

const HOW_IT_WORKS = [
  'Validamos os dados e se o número do processo já está na carteira.',
  'O ativo entra na carteira do NIT e, se houver autor vinculado, aparece em “Meus ativos” dele.',
  'Com a coleta automática da RPI (próxima etapa), cada despacho do processo vira alerta.',
]

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
    if (Object.keys(errors).length > 0) {
      setFormError('Revise os campos destacados.')
      return
    }

    setSubmitting(true)
    try {
      const created = await createAsset({ ...form, author_email: form.author_email.trim() || null })
      navigate('/', { state: { created: created.title } })
    } catch (err) {
      // 409 (processo duplicado) e 422 de regra de negócio vêm como mensagem única;
      // 422 de validação vem com erros por campo.
      if (err.status === 409) {
        setFieldErrors({ process_number: err.message })
        setFormError('Este número de processo já está na carteira.')
      } else if (err.status === 422 && err.message.includes('AUTOR')) {
        setFieldErrors({ author_email: err.message })
        setFormError('Não encontramos o autor informado.')
      } else {
        setFieldErrors(err.fieldErrors ?? {})
        setFormError(err.message)
      }
      setSubmitting(false)
    }
  }

  const actions = (
    <>
      <Button as={Link} to="/">
        Cancelar
      </Button>
      <Button type="submit" variant="primary" icon="check" loading={submitting}>
        {submitting ? 'Salvando…' : 'Salvar ativo'}
      </Button>
    </>
  )

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Carteira · novo ativo"
        title="Cadastrar ativo"
        subtitle="Informe os dados do processo depositado no INPI para começar o acompanhamento."
        actions={actions}
      />

      {formError && <Alert tone="error">{formError}</Alert>}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-5">
          <Card title="Identificação">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <SelectField label="Natureza do ativo" required options={ASSET_TYPES} {...bind('asset_type')} />
              <TextField
                label="Número do processo"
                required
                mono
                placeholder="BR 10 2026 000000-0"
                hint="Formato do INPI, com espaços."
                maxLength={50}
                {...bind('process_number')}
              />
              <TextField
                label="Título"
                required
                placeholder="Ex.: Kit didático de robótica para o ensino médio"
                className="sm:col-span-2"
                maxLength={500}
                {...bind('title')}
              />
              <TextField label="Data de depósito" required type="date" max={todayIso()} {...bind('deposit_date')} />
              <SelectField label="Situação atual" required options={ASSET_STATUSES} {...bind('status')} />
            </div>
          </Card>

          <Card title="Inventores / autores">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <TextField
                label="Inventores / autores"
                required
                placeholder="Nomes completos, separados por vírgula"
                className="sm:col-span-2"
                maxLength={1000}
                {...bind('authors')}
              />
              <TextField
                label="Autor com acesso de acompanhamento"
                type="email"
                icon="email"
                placeholder="nome@instituicao.edu.br"
                hint="Opcional. O e-mail precisa ser de uma conta com perfil AUTOR."
                className="sm:col-span-2"
                {...bind('author_email')}
              />
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card title="Como funciona">
            <ol className="flex flex-col">
              {HOW_IT_WORKS.map((step, index) => (
                <li key={step} className="flex items-start gap-3 border-t border-line py-3 first:border-t-0 first:pt-0">
                  <span className="flex size-7 flex-none items-center justify-center rounded-full bg-primary-soft type-caption font-bold text-primary-ink">
                    {index + 1}
                  </span>
                  <span className="type-body-sm text-ink">{step}</span>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>

      {/* No celular, repete as ações ao fim do formulário para evitar rolar de volta ao topo. */}
      <div className="flex flex-wrap justify-end gap-2 sm:hidden">{actions}</div>
    </form>
  )
}
