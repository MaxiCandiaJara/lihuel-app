import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { MapPin, Calendar, Users } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import StageList from '../../components/obras/StageList'
import Badge from '../../components/ui/Badge'
import { fetchObraById } from '../../services/api'

const ObraDetailPage = () => {
  const { obraId }  = useParams()
  const [obra, setObra] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchObraById(obraId)
        setObra(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [obraId])

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Cargando..." showBack />
        <div className="flex-1 px-4 pt-4 space-y-4">
          {[1,2,3].map(i => <div key={i} className="card h-20 animate-pulse" />)}
        </div>
      </div>
    )
  }

  if (!obra) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Obra no encontrada" showBack />
        <div className="flex items-center justify-center flex-1 text-muted">
          <p>No se pudo cargar la obra.</p>
        </div>
      </div>
    )
  }

  const maestros    = obra.obra_assignments?.filter(a => a.role === 'maestro') || []
  const supervisors = obra.obra_assignments?.filter(a => a.role === 'supervisor') || []
  const approved    = obra.stages?.filter(s => s.status === 'approved').length || 0
  const total       = obra.stages?.length || 6
  const progress    = Math.round((approved / total) * 100)

  return (
    <div className="flex flex-col h-full">
      <TopBar title={obra.name} showBack />

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4 space-y-5">
        {/* Info card */}
        <div className="card p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-extrabold text-textPrimary leading-tight">{obra.name}</h2>
            <Badge status={obra.status} />
          </div>

          <div className="space-y-2 text-sm text-muted">
            <div className="flex items-center gap-2">
              <MapPin size={15} className="text-accent-DEFAULT shrink-0" />
              <span>{obra.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={15} className="text-accent-DEFAULT shrink-0" />
              <span>
                {new Date(obra.start_date).toLocaleDateString('es-AR')} →{' '}
                {new Date(obra.estimated_end_date).toLocaleDateString('es-AR')}
              </span>
            </div>
            {supervisors.length > 0 && (
              <div className="flex items-center gap-2">
                <Users size={15} className="text-accent-DEFAULT shrink-0" />
                <span>Supervisor: {supervisors[0].profiles?.full_name || 'N/A'}</span>
              </div>
            )}
          </div>

          {/* Progress */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-muted">Progreso general</span>
              <span className="font-bold text-accent-DEFAULT">{progress}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-muted mt-1">{approved} de {total} etapas aprobadas</p>
          </div>
        </div>

        {/* Stage timeline */}
        <div>
          <h3 className="text-sm font-bold text-textSecondary uppercase tracking-wide mb-4">
            Etapas de obra
          </h3>
          <StageList
            stages={obra.stages}
            obraId={obraId}
            basePath="/maestro"
            canEdit
          />
        </div>
      </div>
    </div>
  )
}

export default ObraDetailPage
