import { Icon } from './Icon'
import { Spinner } from './Spinner'

const VARIANTS = {
  primary: 'border-primary bg-primary text-on-primary hover:border-primary-hover hover:bg-primary-hover',
  secondary: 'border-line bg-surface text-ink hover:bg-surface-muted',
  ghost: 'border-transparent bg-transparent text-primary-ink hover:bg-primary-soft',
  danger: 'border-line bg-surface text-critical hover:bg-critical-soft',
}

const SIZES = {
  md: 'h-[42px] gap-2 rounded-md px-5 text-sm',
  sm: 'h-[34px] gap-1.5 rounded-sm px-3 text-[13px]',
}

/** Botão do design system. `as` permite renderizar um Link com o mesmo visual. */
export function Button({
  as: Component = 'button',
  variant = 'secondary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}) {
  const iconSize = size === 'sm' ? 16 : 18
  const isButton = Component === 'button'

  return (
    <Component
      type={isButton ? 'button' : undefined}
      {...props}
      disabled={isButton ? disabled || loading : undefined}
      className={`inline-flex items-center justify-center border leading-5 font-bold whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${SIZES[size]} ${VARIANTS[variant]} ${className}`}
    >
      {loading ? <Spinner className="text-current" /> : icon && <Icon name={icon} size={iconSize} />}
      {children}
      {iconRight && <Icon name={iconRight} size={iconSize} />}
    </Component>
  )
}
