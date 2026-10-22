import { initials } from '../../utils/format'

export function Avatar({ name, size = 36 }) {
  return (
    <span
      className="inline-flex flex-none items-center justify-center rounded-full bg-primary font-bold tracking-wide text-on-primary"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
      aria-hidden
    >
      {initials(name)}
    </span>
  )
}
