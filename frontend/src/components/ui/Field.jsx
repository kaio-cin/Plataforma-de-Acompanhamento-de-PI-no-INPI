import { useId } from 'react'

import { Icon } from './Icon'

/** Rótulo + caixa do controle + ajuda/erro, com acessibilidade ligada. */
function FieldShell({ label, required, hint, error, className = '', children }) {
  const id = useId()
  const messageId = `${id}-msg`
  const message = error || hint

  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="type-label text-ink">
        {label}
        {required && (
          <span className="ml-0.5 text-critical" aria-hidden>
            *
          </span>
        )}
      </label>
      <div
        className={`flex h-11 items-center gap-2 rounded-sm border bg-surface px-4 text-ink-subtle transition-shadow focus-within:shadow-[0_0_0_3px_var(--primary-soft)] ${
          error ? 'border-critical' : 'border-line-strong focus-within:border-focus'
        }`}
      >
        {children({
          id,
          required,
          'aria-invalid': Boolean(error),
          'aria-describedby': message ? messageId : undefined,
        })}
      </div>
      {message && (
        <p id={messageId} className={`text-xs leading-4 ${error ? 'font-semibold text-critical' : 'text-ink-subtle'}`}>
          {message}
        </p>
      )}
    </div>
  )
}

const CONTROL = 'min-w-0 flex-1 appearance-none border-0 bg-transparent text-sm font-medium text-ink outline-none placeholder:text-ink-subtle'

export function TextField({ label, required, hint, error, icon, mono = false, className, ...inputProps }) {
  return (
    <FieldShell label={label} required={required} hint={hint} error={error} className={className}>
      {(a11y) => (
        <>
          {icon && <Icon name={icon} size={18} />}
          <input {...inputProps} {...a11y} className={`${CONTROL} ${mono ? 'font-mono text-[13px]' : ''}`} />
        </>
      )}
    </FieldShell>
  )
}

export function SelectField({ label, required, hint, error, className, options, ...selectProps }) {
  return (
    <FieldShell label={label} required={required} hint={hint} error={error} className={className}>
      {(a11y) => (
        <>
          <select {...selectProps} {...a11y} className={`${CONTROL} cursor-pointer`}>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <Icon name="abaixo" size={18} className="pointer-events-none" />
        </>
      )}
    </FieldShell>
  )
}
