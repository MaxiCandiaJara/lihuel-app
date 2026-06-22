import { useState } from 'react'
import { AlertTriangle, Clock, User, ChevronRight } from 'lucide-react'
import Badge from '../ui/Badge'
import { Card } from '../ui/Card'
import { STAGE_LABELS } from '../obras/StageList'
import clsx from 'clsx'

const severityBorder = {
  low:    'border-l-4 border-success',
  medium: 'border-l-4 border-warning',
  high:   'border-l-4 border-danger',
}

const IncidentCard = ({ incident, onClick }) => {
  return (
    <Card
      hover
      onClick={onClick}
      className={clsx('cursor-pointer', severityBorder[incident.severity])}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle
                size={16}
                className={
                  incident.severity === 'high'   ? 'text-danger'  :
                  incident.severity === 'medium' ? 'text-warning' : 'text-success'
                }
              />
              <h3 className="text-sm font-bold text-textPrimary truncate">{incident.title}</h3>
            </div>
            <p className="text-xs text-muted line-clamp-2">{incident.description}</p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge status={incident.severity} />
            <Badge status={incident.status} />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-border text-xs text-muted">
          {incident.obras && (
            <span className="font-medium text-textSecondary">{incident.obras.name}</span>
          )}
          {incident.stages && (
            <span>{STAGE_LABELS[incident.stages.stage_type] || incident.stages.stage_type}</span>
          )}
          {incident.profiles && (
            <span className="flex items-center gap-1">
              <User size={11} />
              {incident.profiles.full_name}
            </span>
          )}
          <span className="flex items-center gap-1 ml-auto">
            <Clock size={11} />
            {new Date(incident.created_at).toLocaleDateString('es-AR')}
          </span>
          <ChevronRight size={14} />
        </div>
      </div>
    </Card>
  )
}

export default IncidentCard
