import { useId } from 'react'

const CONTROL_CLASSES =
  'w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-ink transition-colors placeholder:text-subink/70 focus:outline-none focus:ring-2'

function controlClasses(error) {
  return `${CONTROL_CLASSES} ${error ? 'border-danger focus:ring-danger/20' : 'border-line focus:border-navy focus:ring-navy/15'}`
}

/** Rótulo + controle + mensagem de ajuda/erro, com acessibilidade ligada. */
function FieldShell({ label, hint, error, className = '', children }) {
  const id = useId()
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-ink">
        {label}
      </label>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy })}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="mt-1.5 text-xs text-subink">
            {hint}
          </p>
        )
      )}
    </div>
  )
}

export function TextField({ label, hint, error, className, ...inputProps }) {
  return (
    <FieldShell label={label} hint={hint} error={error} className={className}>
      {(a11y) => <input {...inputProps} {...a11y} className={controlClasses(error)} />}
    </FieldShell>
  )
}

export function SelectField({ label, hint, error, className, options, ...selectProps }) {
  return (
    <FieldShell label={label} hint={hint} error={error} className={className}>
      {(a11y) => (
        <select {...selectProps} {...a11y} className={controlClasses(error)}>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )}
    </FieldShell>
  )
}
