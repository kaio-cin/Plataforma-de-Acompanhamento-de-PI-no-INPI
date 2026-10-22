import { Spinner } from './Spinner'

const VARIANTS = {
  primary: 'bg-navy text-white hover:bg-navy-dark disabled:bg-navy/60',
  secondary: 'border border-line bg-white text-ink hover:bg-canvas disabled:text-subink',
}

export function Button({ variant = 'primary', loading = false, disabled, className = '', children, ...props }) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4.5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
    >
      {loading && <Spinner className="text-current" />}
      {children}
    </button>
  )
}
