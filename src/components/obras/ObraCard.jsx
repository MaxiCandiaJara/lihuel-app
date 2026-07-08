import { useNavigate } from 'react-router-dom'
import { MapPin, Calendar, ChevronRight } from 'lucide-react'
import Badge from '../ui/Badge'
import { Card } from '../ui/Card'

const calcProgress = (stages = []) => {
  if (!stages.length) return 0
  const approved = stages.filter(s => s.status === 'approved').length
  return Math.round((approved / stages.length) * 100)
}

const ObraCard = ({ obra, basePath = '/maestro' }) => {
  const navigate  = useNavigate()
  const progress  = calcProgress(obra.stages)
  const daysLeft  = Math.ceil(
    (new Date(obra.estimated_end_date) - new Date()) / (1000 * 60 * 60 * 24)
  )
  const behind    = daysLeft < 0 && obra.status !== 'completed'

  return (
    <Card
      hover
      onClick={() => navigate(`${basePath}/obras/${obra.id}`)}
      className="cursor-pointer"
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-textPrimary truncate">{obra.name}</h3>
            <div className="flex items-center gap-1.5 mt-1 text-muted text-xs">
              <MapPin size={11} />
              <span className="truncate">{obra.location}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge status={obra.status} />
            {behind && <Badge status="high" label="Atrasada" />}
          </div>
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-muted mb-1">
            <span>Progreso</span>
            <span className="font-semibold text-accent-DEFAULT">{progress}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted">
          <div className="flex items-center gap-1.5">
            <Calendar size={11} />
            <span>
              {behind
                ? `${Math.abs(daysLeft)}d atrasada`
                : obra.status === 'completed'
                  ? 'Finalizada'
                  : `${daysLeft}d restantes`}
            </span>
          </div>
          <ChevronRight size={14} className="opacity-40" />
        </div>
      </div>
    </Card>
  )
}

export default ObraCard
