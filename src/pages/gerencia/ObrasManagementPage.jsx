import { useEffect, useState } from 'react'
import { Plus, MapPin, Calendar, Users, Edit, X, UserPlus } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import ObraCard from '../../components/obras/ObraCard'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import { Input, Select } from '../../components/ui/FormElements'
import { showToast } from '../../components/ui/Toast'
import {
  fetchObras, createObra, updateObra,
  fetchUsersByRole, addAssignment, removeAssignment,
  fetchObraAssignments
} from '../../services/api'
import useAuthStore from '../../store/authStore'

const ObrasManagementPage = () => {
  const { user } = useAuthStore()
  const [obras, setObras]     = useState([])
  const [supervisors, setSupervisors] = useState([])
  const [maestros, setMaestros]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [modal, setModal]             = useState(false)
  const [editObra, setEditObra]       = useState(null)
  const [saving, setSaving]           = useState(false)

  // Assignment state
  const [selectedMaestro, setSelectedMaestro]       = useState('')
  const [selectedSupervisor, setSelectedSupervisor] = useState('')
  const [currentAssignments, setCurrentAssignments] = useState([])

  const emptyForm = { name: '', location: '', start_date: '', estimated_end_date: '', status: 'active' }
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    const load = async () => {
      try {
        const [obs, svs, mts] = await Promise.all([
          fetchObras(user.id, 'gerencia'),
          fetchUsersByRole('supervisor'),
          fetchUsersByRole('maestro'),
        ])
        setObras(obs); setSupervisors(svs); setMaestros(mts)
      } catch { } finally { setLoading(false) }
    }
    if (user) load()
  }, [user])

  const openCreate = () => {
    setForm(emptyForm)
    setEditObra(null)
    setSelectedMaestro('')
    setSelectedSupervisor('')
    setCurrentAssignments([])
    setModal(true)
  }

  const openEdit = async (obra) => {
    setForm({
      name: obra.name, location: obra.location,
      start_date: obra.start_date, estimated_end_date: obra.estimated_end_date,
      status: obra.status,
    })
    setEditObra(obra)

    // Load current assignments for this obra
    try {
      const assignments = await fetchObraAssignments(obra.id)
      setCurrentAssignments(assignments)
      const maestroAssign = assignments.find(a => a.role === 'maestro')
      const supervisorAssign = assignments.find(a => a.role === 'supervisor')
      setSelectedMaestro(maestroAssign?.user_id || '')
      setSelectedSupervisor(supervisorAssign?.user_id || '')
    } catch {
      setCurrentAssignments([])
      setSelectedMaestro('')
      setSelectedSupervisor('')
    }

    setModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name || !form.location || !form.start_date || !form.estimated_end_date) {
      showToast('Completá todos los campos obligatorios', 'warning'); return
    }
    setSaving(true)
    try {
      let obraId
      if (editObra) {
        await updateObra(editObra.id, form)
        obraId = editObra.id
      } else {
        const newObra = await createObra({ ...form, created_by: user.id })
        obraId = newObra.id
      }

      // Handle assignments
      if (obraId) {
        // Process maestro assignment
        const currentMaestro = currentAssignments.find(a => a.role === 'maestro')
        if (selectedMaestro !== (currentMaestro?.user_id || '')) {
          // Remove old maestro if exists
          if (currentMaestro) {
            await removeAssignment(obraId, currentMaestro.user_id)
          }
          // Add new maestro if selected
          if (selectedMaestro) {
            await addAssignment(obraId, selectedMaestro, 'maestro')
          }
        }

        // Process supervisor assignment
        const currentSupervisor = currentAssignments.find(a => a.role === 'supervisor')
        if (selectedSupervisor !== (currentSupervisor?.user_id || '')) {
          // Remove old supervisor if exists
          if (currentSupervisor) {
            await removeAssignment(obraId, currentSupervisor.user_id)
          }
          // Add new supervisor if selected
          if (selectedSupervisor) {
            await addAssignment(obraId, selectedSupervisor, 'supervisor')
          }
        }
      }

      showToast(editObra ? 'Obra actualizada' : 'Obra creada', 'success')
      const updated = await fetchObras(user.id, 'gerencia')
      setObras(updated)
      setModal(false)
    } catch (err) {
      console.error(err)
      showToast('Error al guardar la obra', 'error')
    } finally { setSaving(false) }
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Gestión de Obras"
        actions={
          <Button variant="primary" size="sm" onClick={openCreate} id="btn-new-obra">
            <Plus size={18} /> Nueva Obra
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto px-4 lg:px-6 pt-4 pb-4">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="card h-40 animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {obras.map(o => (
              <div key={o.id} className="relative">
                <ObraCard obra={o} basePath="/gerencia" />
                <button
                  onClick={() => openEdit(o)}
                  id={`edit-obra-${o.id}`}
                  className="absolute top-4 right-4 btn-ghost p-2 rounded-xl text-muted hover:text-textPrimary"
                  title="Editar obra"
                >
                  <Edit size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title={editObra ? `Editar: ${editObra.name}` : 'Nueva Obra'}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input id="obra-name" label="Nombre de la obra *"
            placeholder="Ej: Residencia Los Álamos"
            value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} />
          <Input id="obra-location" label="Ubicación *"
            placeholder="Calle, localidad, provincia"
            value={form.location} onChange={e => setForm(p => ({...p, location: e.target.value}))} />
          <div className="grid grid-cols-2 gap-3">
            <Input id="obra-start" label="Inicio *" type="date"
              value={form.start_date} onChange={e => setForm(p => ({...p, start_date: e.target.value}))} />
            <Input id="obra-end" label="Fin estimado *" type="date"
              value={form.estimated_end_date} onChange={e => setForm(p => ({...p, estimated_end_date: e.target.value}))} />
          </div>
          <Select id="obra-status" label="Estado" value={form.status}
            onChange={e => setForm(p => ({...p, status: e.target.value}))}>
            <option value="active">Activa</option>
            <option value="paused">Pausada</option>
            <option value="completed">Completada</option>
          </Select>

          {/* ── ASSIGNMENT SECTION ── */}
          <div className="border-t border-border pt-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <UserPlus size={16} className="text-accent-DEFAULT" />
              <h3 className="text-sm font-bold text-textSecondary">Asignar equipo</h3>
            </div>

            <div className="space-y-3">
              <Select id="obra-maestro" label="Maestro de obra"
                value={selectedMaestro}
                onChange={e => setSelectedMaestro(e.target.value)}>
                <option value="">Sin asignar</option>
                {maestros.map(m => (
                  <option key={m.id} value={m.id}>{m.full_name}</option>
                ))}
              </Select>

              <Select id="obra-supervisor" label="Supervisor"
                value={selectedSupervisor}
                onChange={e => setSelectedSupervisor(e.target.value)}>
                <option value="">Sin asignar</option>
                {supervisors.map(s => (
                  <option key={s.id} value={s.id}>{s.full_name}</option>
                ))}
              </Select>
            </div>

            {/* Show current assignments */}
            {currentAssignments.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-muted">Asignaciones actuales:</p>
                {currentAssignments.map(a => (
                  <div key={a.id} className="flex items-center gap-2 text-xs text-textSecondary bg-surface rounded-lg px-3 py-2">
                    <Avatar name={a.profiles?.full_name || ''} size="sm" />
                    <span className="flex-1">{a.profiles?.full_name || 'Desconocido'}</span>
                    <span className="text-muted capitalize">{a.role}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" className="flex-1" loading={saving} id="btn-save-obra">
              {editObra ? 'Guardar cambios' : 'Crear obra'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default ObrasManagementPage
