import { useState, useRef, useCallback } from 'react'
import { Check, X, Camera, Trash2, Send, ChevronDown } from 'lucide-react'
import Button from '../ui/Button'
import { Textarea } from '../ui/FormElements'
import { showToast } from '../ui/Toast'
import { updateChecklistItem, submitStage, uploadPhoto } from '../../services/api'
import { createNotification, fetchUsersByRole } from '../../services/api'
import useSyncStore from '../../store/syncStore'
import useAuthStore from '../../store/authStore'
import clsx from 'clsx'

const ChecklistForm = ({ stage, obraId, obraName, onSubmitted }) => {
  const { user }   = useAuthStore()
  const { isOnline, enqueue } = useSyncStore()

  const [items, setItems]         = useState(stage.checklist_items || [])
  const [observations, setObs]    = useState(stage.observations || '')
  const [photos, setPhotos]       = useState(stage.stage_photos || [])
  const [pendingPhotos, setPending] = useState([])  // files with preview
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading]  = useState(false)
  const fileInputRef               = useRef(null)

  const alreadySubmitted = stage.status === 'in_review' || stage.status === 'approved'

  const toggleItem = async (itemId, currentStatus) => {
    const next = currentStatus === 'done' ? 'not_done' : 'done'
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, status: next } : i))
    try {
      if (isOnline) {
        await updateChecklistItem(itemId, next)
      } else {
        await enqueue('update_checklist', { items: [{ id: itemId, status: next }] })
      }
    } catch {
      // revert
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, status: currentStatus } : i))
      showToast('Error al actualizar ítem', 'error')
    }
  }

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files || [])
    const previews = files.map(f => ({
      file: f,
      preview: URL.createObjectURL(f),
      name: f.name,
    }))
    setPending(prev => [...prev, ...previews])
    e.target.value = ''
  }

  const removePending = (idx) => {
    setPending(prev => {
      URL.revokeObjectURL(prev[idx].preview)
      return prev.filter((_, i) => i !== idx)
    })
  }

  const uploadPending = async () => {
    if (!pendingPhotos.length || !isOnline) return
    setUploading(true)
    try {
      const uploaded = await Promise.all(
        pendingPhotos.map(p => uploadPhoto(stage.id, user.id, p.file))
      )
      setPhotos(prev => [...prev, ...uploaded])
      setPending([])
      showToast(`${uploaded.length} foto(s) subida(s)`, 'success')
    } catch (err) {
      showToast('Error al subir fotos', 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    const doneCount = items.filter(i => i.status === 'done').length
    if (doneCount === 0) {
      showToast('Debes marcar al menos un ítem como realizado', 'warning')
      return
    }

    setSubmitting(true)
    try {
      if (isOnline) {
        // Upload any pending photos first
        if (pendingPhotos.length > 0) await uploadPending()
        await submitStage(stage.id, observations, user.id)

        // Notify supervisors
        const supervisors = await fetchUsersByRole('supervisor')
        await Promise.all(
          supervisors.map(sv =>
            createNotification(
              sv.id,
              'stage_submitted',
              `Nueva etapa para revisión`,
              `${obraName}: etapa lista para revisión por ${user.email}`,
              { related_obra_id: obraId, related_stage_id: stage.id }
            )
          )
        )

        showToast('¡Etapa enviada para revisión!', 'success')
        onSubmitted?.()
      } else {
        await enqueue('submit_stage', {
          stageId: stage.id,
          observations,
          userId: user.id,
        })
        showToast('Sin conexión — enviado a cola offline', 'warning')
        onSubmitted?.()
      }
    } catch (err) {
      showToast('Error al enviar la etapa', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const doneCount  = items.filter(i => i.status === 'done').length
  const totalCount = items.length
  const progress   = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Checklist progress */}
      <div className="bg-surface rounded-xl p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted font-medium">Ítems completados</span>
          <span className="font-bold text-accent-DEFAULT">{doneCount}/{totalCount}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-textSecondary uppercase tracking-wide">
          Lista de control
        </h3>
        {items.map((item, idx) => (
          <button
            key={item.id}
            id={`checklist-item-${item.id}`}
            onClick={() => !alreadySubmitted && toggleItem(item.id, item.status)}
            disabled={alreadySubmitted}
            className={clsx(
              'w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-150 text-left',
              item.status === 'done'
                ? 'bg-success/10 border-success/40 text-textPrimary'
                : 'bg-surface border-border text-textSecondary hover:border-accent-DEFAULT/50',
              alreadySubmitted && 'cursor-default'
            )}
            style={{ minHeight: 56 }}
          >
            <div className={clsx(
              'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
              item.status === 'done'
                ? 'bg-success border-success text-white'
                : 'border-border'
            )}>
              {item.status === 'done' && <Check size={14} />}
            </div>
            <span className={clsx(
              'flex-1 text-sm font-medium',
              item.status === 'done' && 'line-through opacity-70'
            )}>
              {idx + 1}. {item.description}
            </span>
            {item.status === 'not_done' && !alreadySubmitted && (
              <X size={16} className="text-danger shrink-0 opacity-50" />
            )}
          </button>
        ))}
      </div>

      {/* Photo upload */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-textSecondary uppercase tracking-wide">
          Fotos de la etapa
        </h3>

        {/* Existing photos */}
        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {photos.map(photo => (
              <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden bg-surface">
                <img
                  src={photo.public_url}
                  alt="Foto etapa"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}

        {/* Pending previews */}
        {pendingPhotos.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {pendingPhotos.map((p, idx) => (
              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-surface border-2 border-dashed border-accent-DEFAULT/50">
                <img
                  src={p.preview}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removePending(idx)}
                  className="absolute top-1 right-1 bg-danger rounded-full p-0.5"
                >
                  <X size={12} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {!alreadySubmitted && (
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              className="hidden"
              onChange={handlePhotoSelect}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1"
            >
              <Camera size={18} />
              Agregar foto(s)
            </Button>
            {pendingPhotos.length > 0 && isOnline && (
              <Button
                variant="secondary"
                onClick={uploadPending}
                loading={uploading}
              >
                Subir {pendingPhotos.length}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Observations */}
      <Textarea
        id="stage-observations"
        label="Observaciones"
        placeholder="Detalles, comentarios, materiales usados..."
        value={observations}
        onChange={e => setObs(e.target.value)}
        rows={4}
        disabled={alreadySubmitted}
      />

      {/* Submit */}
      {!alreadySubmitted && (
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleSubmit}
          loading={submitting}
          id="btn-submit-stage"
        >
          <Send size={20} />
          {isOnline ? 'Enviar para revisión' : 'Guardar en cola offline'}
        </Button>
      )}

      {alreadySubmitted && (
        <div className="bg-success/10 border border-success/30 rounded-xl p-4 text-center">
          <p className="text-success font-semibold">✅ Etapa enviada para revisión</p>
          <p className="text-muted text-sm mt-1">Esperando aprobación del supervisor</p>
        </div>
      )}
    </div>
  )
}

export default ChecklistForm
