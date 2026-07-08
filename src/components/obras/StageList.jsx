import { useNavigate } from 'react-router-dom'
import { CheckSquare, Clock, ChevronRight, Camera } from 'lucide-react'
import Badge from '../ui/Badge'
import clsx from 'clsx'

export const STAGE_LABELS = {
  obra_gruesa:               'Obra Gruesa',
  instalaciones_electricas:  'Instalaciones Eléctricas',
  instalaciones_sanitarias:  'Instalaciones Sanitarias',
  terminaciones:             'Terminaciones',
  paisajismo_exteriores:     'Paisajismo y Exteriores',
  inspeccion_final:          'Inspección Final',
}

export const STAGE_ORDER = [
  'obra_gruesa',
  'instalaciones_electricas',
  'instalaciones_sanitarias',
  'terminaciones',
  'paisajismo_exteriores',
  'inspeccion_final',
]

const StageList = ({ stages = [], obraId, basePath = '/maestro', canEdit = false }) => {
  const navigate   = useNavigate()
  const sorted     = STAGE_ORDER.map(type => stages.find(s => s.stage_type === type)).filter(Boolean)

  return (
    <div className="relative">
      {/* Vertical connector line */}
      <div className="absolute left-[11px] top-0 bottom-0 w-px bg-border" />

      <div className="space-y-2">
        {sorted.map((stage, idx) => {
          const done   = stage.checklist_items?.filter(i => i.status === 'done').length || 0
          const total  = stage.checklist_items?.length || 0
          const photos = stage.stage_photos?.length || 0

          const dotColor =
            stage.status === 'approved'  ? 'bg-success'           :
            stage.status === 'in_review' ? 'bg-warning animate-pulse' :
            stage.status === 'rejected'  ? 'bg-danger'            : 'bg-border'

          return (
            <div
              key={stage.id}
              className={clsx(
                'relative flex gap-3 pl-1',
                idx < sorted.length - 1 && 'pb-1'
              )}
            >
              {/* Timeline dot */}
              <div className={clsx('w-5 h-5 rounded-full border-2 border-card shrink-0 mt-3 z-10', dotColor)} />

              {/* Stage card */}
              <div
                className={clsx(
                  'flex-1 card p-3.5 transition-all duration-150',
                  canEdit && stage.status !== 'in_review' && 'hover:border-accent-DEFAULT/30 cursor-pointer'
                )}
                onClick={() => {
                  if (canEdit) navigate(`${basePath}/obras/${obraId}/etapa/${stage.id}`)
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-textPrimary">
                      {idx + 1}. {STAGE_LABELS[stage.stage_type]}
                    </p>
                    {stage.rejection_comment && (
                      <p className="text-xs text-danger mt-1 bg-danger/10 px-2 py-1 rounded-lg">
                        {stage.rejection_comment}
                      </p>
                    )}
                    {stage.submitted_at && (
                      <p className="text-[11px] text-muted mt-1 flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(stage.submitted_at).toLocaleDateString('es-AR')}
                      </p>
                    )}
                  </div>
                  <Badge status={stage.status} />
                </div>

                {/* Checklist progress */}
                {total > 0 && (
                  <div className="mt-2.5 flex items-center gap-3 text-[11px] text-muted">
                    <div className="flex items-center gap-1">
                      <CheckSquare size={11} />
                      <span>{done}/{total}</span>
                    </div>
                    {photos > 0 && (
                      <div className="flex items-center gap-1">
                        <Camera size={11} />
                        <span>{photos}</span>
                      </div>
                    )}
                    {canEdit && stage.status !== 'in_review' && (
                      <ChevronRight size={13} className="ml-auto text-accent-DEFAULT opacity-50" />
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default StageList
