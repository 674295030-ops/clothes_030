import type { ReactNode } from 'react'

export function AdminStat({
  icon,
  label,
  value,
  helper,
  tone = '',
  onClick,
}: {
  icon: ReactNode
  label: string
  value: string
  helper: string
  tone?: string
  onClick: () => void
}) {
  return (
    <button type="button" className={'admin-stat ' + tone + ' is-interactive'} onClick={onClick} aria-label={label + ': ' + value}>
      <span className="admin-stat-icon">{icon}</span>
      <span className="admin-stat-label">{label}</span>
      <strong>{value}</strong>
      <small>{helper}</small>
    </button>
  )
}
