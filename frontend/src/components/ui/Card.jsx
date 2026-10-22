export function Card({ className = '', children }) {
  return <div className={`rounded-xl border border-line bg-white ${className}`}>{children}</div>
}
