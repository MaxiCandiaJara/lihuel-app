import clsx from 'clsx'

const variantMap = {
  // Stage statuses
  pending:   'badge-pending',
  in_review: 'badge-review',
  approved:  'badge-approved',
  rejected:  'badge-rejected',
  // Obra statuses
  active:    'badge-active',
  paused:    'badge-paused',
  completed: 'badge-completed',
  // Incident statuses
  open:      'badge-open',
  assigned:  'badge-assigned',
  resolved:  'badge-resolved',
  // Severity
  low:       'badge-low',
  medium:    'badge-medium',
  high:      'badge-high',
}

const labelMap = {
  pending:   'Pendiente',
  in_review: 'En Revisión',
  approved:  'Aprobada',
  rejected:  'Rechazada',
  active:    'Activa',
  paused:    'Pausada',
  completed: 'Completada',
  open:      'Abierto',
  assigned:  'Asignado',
  resolved:  'Resuelto',
  low:       'Baja',
  medium:    'Media',
  high:      'Alta',
}

const dotMap = {
  pending:   '⬜',
  in_review: '🟡',
  approved:  '✅',
  rejected:  '❌',
  active:    '🟢',
  paused:    '⏸️',
  completed: '✅',
  open:      '🔴',
  assigned:  '🟠',
  resolved:  '✅',
  low:       '🟢',
  medium:    '🟠',
  high:      '🔴',
}

export const Badge = ({ status, label, className }) => {
  const cls    = variantMap[status] || 'badge-pending'
  const text   = label || labelMap[status] || status
  const dot    = dotMap[status] || ''

  return (
    <span className={clsx(cls, className)}>
      {dot} {text}
    </span>
  )
}

export default Badge
