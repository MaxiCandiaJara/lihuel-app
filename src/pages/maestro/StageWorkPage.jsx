import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import TopBar from '../../components/layout/TopBar'
import ChecklistForm from '../../components/checklist/ChecklistForm'
import Badge from '../../components/ui/Badge'
import { fetchStage, fetchObraById } from '../../services/api'
import { STAGE_LABELS } from '../../components/obras/StageList'

const StageWorkPage = () => {
  const { obraId, stageId } = useParams()
  const [stage, setStage]   = useState(null)
  const [obra, setObra]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [stageData, obraData] = await Promise.all([
          fetchStage(stageId),
          fetchObraById(obraId),
        ])
        setStage(stageData)
        setObra(obraData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [stageId, obraId])

  const handleSubmitted = async () => {
    const refreshed = await fetchStage(stageId)
    setStage(refreshed)
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Cargando etapa..." showBack />
        <div className="flex-1 px-4 pt-4 space-y-4">
          {[1,2,3,4,5].map(i => <div key={i} className="card h-14 animate-pulse" />)}
        </div>
      </div>
    )
  }

  const stageLabel = stage ? STAGE_LABELS[stage.stage_type] : 'Etapa'

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title={stageLabel}
        showBack
        actions={stage && <Badge status={stage.status} />}
      />

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
        {stage && obra && (
          <ChecklistForm
            stage={stage}
            obraId={obraId}
            obraName={obra.name}
            onSubmitted={handleSubmitted}
          />
        )}
      </div>
    </div>
  )
}

export default StageWorkPage
