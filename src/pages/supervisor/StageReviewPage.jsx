import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Check, X, MessageSquare, Camera, ChevronRight } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { Textarea } from '../../components/ui/FormElements'
import Modal from '../../components/ui/Modal'
import { showToast } from '../../components/ui/Toast'
import { fetchStage, fetchObraById, reviewStage, createNotification } from '../../services/api'
import { STAGE_LABELS } from '../../components/obras/StageList'
import useAuthStore from '../../store/authStore'

const StageReviewPage = () => {
  const { obraId, stageId } = useParams()
  const navigate   = useNavigate()
  const { user }   = useAuthStore()

  const [stage, setStage]           = useState(null)
  const [obra, setObra]             = useState(null)
  const [loading, setLoading]       = useState(true)
  const [rejectModal, setRejectModal] = useState(false)
  const [rejectComment, setRejectComment] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const [s, o] = await Promise.all([fetchStage(stageId), fetchObraById(obraId)])
        setStage(s)
        setObra(o)
      } catch { } finally { setLoading(false) }
    }
    load()
  }, [stageId, obraId])

  const getMaestroId = () => {
    return obra?.obra_assignments?.find(a => a.role === 'maestro')?.user_id
  }

  const doReview = async (approved, comment = '') => {
    setProcessing(true)
    try {
      await reviewStage(stageId, approved, comment, user.id)
      const maestroId = getMaestroId()
      if (maestroId) {
        await createNotification(
          maestroId,
          approved ? 'stage_approved' : 'stage_rejected',
          approved ? '✅ Etapa aprobada' : '❌ Etapa rechazada',
          approved
            ? `Tu etapa "${STAGE_LABELS[stage.stage_type]}" fue aprobada en ${obra?.name}`
            : `Tu etapa "${STAGE_LABELS[stage.stage_type]}" fue rechazada: ${comment}`,
          { related_obra_id: obraId, related_stage_id: stageId }
        )
      }
      showToast(approved ? '✅ Etapa aprobada' : '❌ Etapa rechazada', approved ? 'success' : 'error')
      navigate(-1)
    } catch {
      showToast('Error al procesar la revisión', 'error')
    } finally {
      setProcessing(false); setRejectModal(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Revisando etapa..." showBack />
        <div className="flex-1 px-4 pt-4 space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="card h-14 animate-pulse" />)}
        </div>
      </div>
    )
  }

  const doneCount  = stage?.checklist_items?.filter(i => i.status === 'done').length || 0
  const totalCount = stage?.checklist_items?.length || 0

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title={`Revisión: ${STAGE_LABELS[stage?.stage_type] || ''}`}
        showBack
        actions={<Badge status={stage?.status} />}
      />

      <div className="flex-1 overflow-y-auto px-4 lg:px-6 pt-4 pb-24 space-y-5">
        {/* Info */}
        <div className="card p-4">
          <p className="text-sm text-muted">Obra</p>
          <p className="font-bold text-textPrimary">{obra?.name}</p>
          {stage?.submitted_at && (
            <p className="text-xs text-muted mt-1">
              Enviada el {new Date(stage.submitted_at).toLocaleString('es-AR')}
            </p>
          )}
        </div>

        {/* Checklist review */}
        <div>
          <h3 className="text-sm font-bold text-textSecondary uppercase tracking-wide mb-3">
            Lista de control — {doneCount}/{totalCount} completados
          </h3>
          <div className="space-y-2">
            {(stage?.checklist_items || []).map((item, idx) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-4 rounded-xl ${
                  item.status === 'done'
                    ? 'bg-success/10 border border-success/30'
                    : 'bg-surface border border-border'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  item.status === 'done' ? 'bg-success' : 'bg-border'
                }`}>
                  {item.status === 'done'
                    ? <Check size={14} className="text-white" />
                    : <X size={14} className="text-muted" />}
                </div>
                <span className={`text-sm flex-1 ${
                  item.status === 'done' ? 'text-textPrimary' : 'text-muted'
                }`}>
                  {idx + 1}. {item.description}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Observations */}
        {stage?.observations && (
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare size={16} className="text-accent-DEFAULT" />
              <h3 className="text-sm font-bold text-textSecondary">Observaciones del Maestro</h3>
            </div>
            <p className="text-sm text-textPrimary">{stage.observations}</p>
          </div>
        )}

        {/* Photos */}
        {stage?.stage_photos?.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Camera size={16} className="text-accent-DEFAULT" />
              <h3 className="text-sm font-bold text-textSecondary uppercase tracking-wide">
                Fotos ({stage.stage_photos.length})
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {stage.stage_photos.map(photo => (
                <a
                  key={photo.id}
                  href={photo.public_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative aspect-square rounded-xl overflow-hidden bg-surface block"
                >
                  <img
                    src={photo.public_url}
                    alt="Foto de etapa"
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Previous rejection comment */}
        {stage?.rejection_comment && (
          <div className="bg-danger/10 border border-danger/30 rounded-xl p-4">
            <p className="text-xs text-danger font-bold uppercase mb-1">Rechazo anterior</p>
            <p className="text-sm text-textPrimary">{stage.rejection_comment}</p>
          </div>
        )}
      </div>

      {/* Review actions (fixed bottom) */}
      {stage?.status === 'in_review' && (
        <div className="fixed bottom-0 left-0 right-0 lg:relative bg-card/90 backdrop-blur border-t border-border p-4 flex gap-3">
          <Button
            variant="danger"
            size="lg"
            className="flex-1"
            onClick={() => setRejectModal(true)}
            loading={processing}
            id="btn-reject-stage"
          >
            <X size={20} />
            Rechazar
          </Button>
          <Button
            variant="success"
            size="lg"
            className="flex-1"
            onClick={() => doReview(true)}
            loading={processing}
            id="btn-approve-stage"
          >
            <Check size={20} />
            Aprobar
          </Button>
        </div>
      )}

      {/* Reject modal */}
      <Modal
        isOpen={rejectModal}
        onClose={() => setRejectModal(false)}
        title="Rechazar etapa"
        bottomSheet
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            El Maestro será notificado con el motivo para que pueda corregir y reenviar.
          </p>
          <Textarea
            id="reject-comment"
            label="Motivo del rechazo"
            placeholder="Describí qué debe corregir el Maestro..."
            value={rejectComment}
            onChange={e => setRejectComment(e.target.value)}
            rows={4}
          />
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setRejectModal(false)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              disabled={!rejectComment.trim()}
              loading={processing}
              onClick={() => doReview(false, rejectComment)}
              id="btn-confirm-reject"
            >
              Confirmar rechazo
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default StageReviewPage
