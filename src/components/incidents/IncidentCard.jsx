import { AlertTriangle, Clock, User, ChevronRight } from 'lucide-react'
import Badge from '../ui/Badge'
import { Card } from '../ui/Card'
import { STAGE_LABELS } from '../obras/StageList'
import clsx from 'clsx'

const severityBorder = {
  low:    'border-l-2 border-l-success',
  medium: 'border-l-2 border-l-warning',
  high:   'border-l-2 border-l-danger',
}

const IncidentCard = ({ incident, onClick }) => {
  return (
    <Card
      hover
      onClick={onClick}
      className={clsx('cursor-pointer', severityBorder[incident.severity])}
    >
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-textPrimary truncate">{incident.title}</h3>
            <p className="text-[11px] text-muted line-clamp-1 mt-0.5">{incident.description}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Badge status={incident.severity} />
            <Badge status={incident.status} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-border/50 text-[11px] text-muted">
          {incident.obras && (
            <span className="text-textSecondary">{incident.obras.name}</span>
          )}
          {incident.profiles && (
            <span className="flex items-center gap-1">
              <User size={10} />
              {incident.profiles.full_name}
            </span>
          )}
          <span className="flex items-center gap-1 ml-auto">
            <Clock size={10} />
            {new Date(incident.created_at).toLocaleDateString('es-AR')}
          </span>
        </div>
      </div>
    </Card>
  )
}

export default IncidentCard
