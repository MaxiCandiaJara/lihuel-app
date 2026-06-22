import { useNavigate } from 'react-router-dom'
import { MapPin, Calendar, ChevronRight } from 'lucide-react'
import Badge from '../ui/Badge'
import { Card } from '../ui/Card'

const STAGE_LABELS = {
  obra_gruesa:               'Obra Gruesa',
  instalaciones_electricas:  'Inst. Eléctricas',
  instalaciones_sanitarias:  'Inst. Sanitarias',
  terminaciones:             'Terminaciones',
  paisajismo_exteriores:     'Paisajismo',
  inspeccion_final:          'Insp. Final',
}

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
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-textPrimary truncate">{obra.name}</h3>
            <div className="flex items-center gap-1 mt-1 text-muted text-xs">
              <MapPin size={12} />
              <span className="truncate">{obra.location}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Badge status={obra.status} />
            {behind && <Badge status="high" label="Atrasada" />}
          </div>
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-muted mb-1.5">
            <span>Progreso general</span>
            <span className="font-bold text-accent-DEFAULT">{progress}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stage pills */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {(obra.stages || []).map(stage => (
            <div
              key={stage.stage_type}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface text-xs"
              title={STAGE_LABELS[stage.stage_type]}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${
                stage.status === 'approved'  ? 'bg-success' :
                stage.status === 'in_review' ? 'bg-warning' :
                stage.status === 'rejected'  ? 'bg-danger'  : 'bg-border'
              }`} />
              <span className="text-muted">{STAGE_LABELS[stage.stage_type]}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted">
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>
              {behind
                ? `Atrasada ${Math.abs(daysLeft)} días`
                : obra.status === 'completed'
                  ? 'Finalizada'
                  : `${daysLeft} días restantes`}
            </span>
          </div>
          <ChevronRight size={16} />
        </div>
      </div>
    </Card>
  )
}

export default ObraCard
