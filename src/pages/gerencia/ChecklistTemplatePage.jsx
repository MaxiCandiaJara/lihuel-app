import { useEffect, useState } from 'react'
import { Plus, Trash2, ListChecks } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import Button from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/FormElements'
import { showToast } from '../../components/ui/Toast'
import { fetchTemplates, createTemplate, deleteTemplate } from '../../services/api'
import useAuthStore from '../../store/authStore'

const STAGE_TYPES = [
  { value: 'obra_gruesa',               label: 'Obra Gruesa' },
  { value: 'instalaciones_electricas',  label: 'Instalaciones Eléctricas' },
  { value: 'instalaciones_sanitarias',  label: 'Instalaciones Sanitarias' },
  { value: 'terminaciones',             label: 'Terminaciones' },
  { value: 'paisajismo_exteriores',     label: 'Paisajismo y Exteriores' },
  { value: 'inspeccion_final',          label: 'Inspección Final' },
]

const ChecklistTemplatePage = () => {
  const { user }            = useAuthStore()
  const [templates, setTemplates] = useState([])
  const [loading, setLoading]     = useState(true)
  const [activeStage, setActive]  = useState('obra_gruesa')
  const [newItem, setNewItem]     = useState('')
  const [saving, setSaving]       = useState(false)

  const load = async () => {
    try {
      const data = await fetchTemplates()
      setTemplates(data)
    } catch { } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const stageItems = templates
    .filter(t => t.stage_type === activeStage)
    .sort((a, b) => a.order_index - b.order_index)

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newItem.trim()) return
    setSaving(true)
    try {
      await createTemplate({
        stage_type: activeStage,
        description: newItem.trim(),
        order_index: stageItems.length + 1,
        created_by: user.id,
      })
      setNewItem('')
      await load()
      showToast('Ítem agregado al template', 'success')
    } catch { showToast('Error al agregar ítem', 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    try {
      await deleteTemplate(id)
      await load()
      showToast('Ítem eliminado', 'info')
    } catch { showToast('Error al eliminar', 'error') }
  }

  const activeLabel = STAGE_TYPES.find(s => s.value === activeStage)?.label

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Templates de Checklist" />

      <div className="flex-1 overflow-y-auto px-4 lg:px-6 pt-4 pb-4 space-y-5">
        {/* Stage selector tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {STAGE_TYPES.map(st => (
            <button
              key={st.value}
              id={`tab-${st.value}`}
              onClick={() => setActive(st.value)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all
                ${activeStage === st.value
                  ? 'bg-accent-DEFAULT text-white shadow-lg shadow-accent-DEFAULT/30'
                  : 'bg-card border border-border text-muted hover:text-textPrimary'}`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Current stage label */}
        <div className="flex items-center gap-3">
          <ListChecks size={20} className="text-accent-DEFAULT" />
          <div>
            <h2 className="text-base font-bold text-textPrimary">{activeLabel}</h2>
            <p className="text-xs text-muted">{stageItems.length} ítem(s) en el template</p>
          </div>
        </div>

        {/* Template items */}
        {loading ? (
          <div className="space-y-2">
            {[1,2,3,4].map(i => <div key={i} className="card h-14 animate-pulse" />)}
          </div>
        ) : stageItems.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-muted">No hay ítems en este template.</p>
            <p className="text-sm text-muted/60 mt-1">Agregá uno abajo.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {stageItems.map((item, idx) => (
              <div key={item.id}
                className="card p-4 flex items-center gap-4">
                <span className="text-muted text-sm font-bold w-6 text-right shrink-0">{idx + 1}</span>
                <p className="flex-1 text-sm text-textPrimary">{item.description}</p>
                <button
                  onClick={() => handleDelete(item.id)}
                  id={`delete-template-${item.id}`}
                  className="btn-ghost p-2 rounded-xl text-muted hover:text-danger transition-colors"
                  title="Eliminar ítem"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add new item */}
        <form onSubmit={handleAdd} className="card p-4 space-y-3">
          <h3 className="text-sm font-bold text-textSecondary">Agregar ítem al template</h3>
          <div className="flex gap-2">
            <input
              id="new-template-item"
              type="text"
              className="input flex-1"
              placeholder="Descripción del ítem de checklist..."
              value={newItem}
              onChange={e => setNewItem(e.target.value)}
            />
            <Button type="submit" variant="primary" loading={saving} id="btn-add-template-item">
              <Plus size={18} />
            </Button>
          </div>
          <p className="text-xs text-muted">
            ⚠️ Los cambios al template no afectan obras ya creadas, solo las nuevas.
          </p>
        </form>
      </div>
    </div>
  )
}

export default ChecklistTemplatePage
