import { useEffect, useState } from 'react'
import { Plus, AlertTriangle, Filter } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import IncidentCard from '../../components/incidents/IncidentCard'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Input, Textarea, Select } from '../../components/ui/FormElements'
import { showToast } from '../../components/ui/Toast'
import {
  fetchIncidents, createIncident, updateIncident,
  fetchObras, fetchAllUsers, createNotification
} from '../../services/api'
import useAuthStore from '../../store/authStore'

const IncidentCenterPage = () => {
  const { user, profile } = useAuthStore()
  const [incidents, setIncidents] = useState([])
  const [obras, setObras]         = useState([])
  const [users, setUsers]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [filterStatus, setFilter] = useState('all')
  const [createModal, setCreateModal] = useState(false)
  const [detailModal, setDetailModal] = useState(null)
  const [saving, setSaving]           = useState(false)

  const [form, setForm] = useState({
    title: '', description: '', obra_id: '', severity: 'medium',
    status: 'open', assigned_to: '',
  })

  useEffect(() => {
    const load = async () => {
      try {
        const [inc, obs, usrs] = await Promise.all([
          fetchIncidents(),
          fetchObras(user.id, 'gerencia'),
          fetchAllUsers(),
        ])
        setIncidents(inc); setObras(obs); setUsers(usrs)
      } catch { } finally { setLoading(false) }
    }
    if (user) load()
  }, [user])

  const reload = async () => {
    const inc = await fetchIncidents()
    setIncidents(inc)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.title || !form.obra_id) {
      showToast('Título y obra son obligatorios', 'warning'); return
    }
    setSaving(true)
    try {
      const newInc = await createIncident({ ...form, created_by: user.id })
      // Notify gerencia on high severity
      if (form.severity === 'high') {
        const gerentes = users.filter(u => u.role === 'gerencia')
        await Promise.all(gerentes.map(g =>
          createNotification(g.id, 'incident_high', '🚨 Incidente de alta severidad',
            `"${form.title}" — requiere atención inmediata`, { related_incident_id: newInc.id })
        ))
      }
      await reload()
      setCreateModal(false)
      setForm({ title: '', description: '', obra_id: '', severity: 'medium', status: 'open', assigned_to: '' })
      showToast('Incidente creado', 'success')
    } catch { showToast('Error al crear incidente', 'error') }
    finally { setSaving(false) }
  }

  const handleStatusUpdate = async (incident, newStatus) => {
    try {
      await updateIncident(incident.id, {
        status: newStatus,
        ...(newStatus === 'resolved' ? { resolved_at: new Date().toISOString() } : {})
      })
      await reload()
      setDetailModal(null)
      showToast('Estado actualizado', 'success')
    } catch { showToast('Error al actualizar', 'error') }
  }

  const filtered = incidents.filter(i =>
    filterStatus === 'all' || i.status === filterStatus
  )

  const counts = {
    open:     incidents.filter(i => i.status === 'open').length,
    assigned: incidents.filter(i => i.status === 'assigned').length,
    resolved: incidents.filter(i => i.status === 'resolved').length,
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Centro de Incidentes"
        actions={
          <Button variant="primary" size="sm" onClick={() => setCreateModal(true)} id="btn-new-incident">
            <Plus size={18} />
            Nuevo
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto px-4 lg:px-6 pt-4 pb-4 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Abiertos',   value: counts.open,     color: 'text-danger' },
            { label: 'Asignados',  value: counts.assigned, color: 'text-warning' },
            { label: 'Resueltos',  value: counts.resolved, color: 'text-success' },
          ].map(s => (
            <div key={s.label} className="card p-3 text-center">
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {[
            { v: 'all',      l: 'Todos' },
            { v: 'open',     l: 'Abiertos' },
            { v: 'assigned', l: 'Asignados' },
            { v: 'resolved', l: 'Resueltos' },
          ].map(f => (
            <button key={f.v} id={`filter-${f.v}`}
              onClick={() => setFilter(f.v)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all
                ${filterStatus === f.v
                  ? 'bg-accent-DEFAULT text-white'
                  : 'bg-card border border-border text-muted hover:text-textPrimary'}`}
            >
              {f.l}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[1,2].map(i => <div key={i} className="card h-28 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertTriangle size={48} className="text-muted mb-4 opacity-30" />
            <p className="text-textSecondary font-semibold">Sin incidentes</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(inc => (
              <IncidentCard
                key={inc.id}
                incident={inc}
                onClick={() => setDetailModal(inc)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Nuevo Incidente" bottomSheet>
        <form onSubmit={handleCreate} className="space-y-4">
          <Input id="inc-title" label="Título" placeholder="Breve descripción del incidente"
            value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} />
          <Textarea id="inc-desc" label="Descripción detallada" rows={3}
            value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} />
          <Select id="inc-obra" label="Obra" value={form.obra_id}
            onChange={e => setForm(p => ({...p, obra_id: e.target.value}))}>
            <option value="">Seleccionar obra...</option>
            {obras.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </Select>
          <Select id="inc-severity" label="Severidad" value={form.severity}
            onChange={e => setForm(p => ({...p, severity: e.target.value}))}>
            <option value="low">🟢 Baja</option>
            <option value="medium">🟠 Media</option>
            <option value="high">🔴 Alta</option>
          </Select>
          <Select id="inc-assigned" label="Asignar a (opcional)" value={form.assigned_to}
            onChange={e => setForm(p => ({...p, assigned_to: e.target.value, status: e.target.value ? 'assigned' : 'open'}))}>
            <option value="">Sin asignar</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>)}
          </Select>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setCreateModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" className="flex-1" loading={saving} id="btn-save-incident">
              Crear incidente
            </Button>
          </div>
        </form>
      </Modal>

      {/* Detail modal */}
      {detailModal && (
        <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title={detailModal.title} bottomSheet>
          <div className="space-y-4">
            <p className="text-sm text-muted">{detailModal.description}</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-muted text-xs">Obra</p><p className="font-semibold">{detailModal.obras?.name || '—'}</p></div>
              <div><p className="text-muted text-xs">Severidad</p><p className="font-semibold capitalize">{detailModal.severity}</p></div>
              <div><p className="text-muted text-xs">Estado</p><p className="font-semibold capitalize">{detailModal.status}</p></div>
              <div><p className="text-muted text-xs">Asignado a</p><p className="font-semibold">{detailModal.profiles?.full_name || 'Nadie'}</p></div>
            </div>
            {detailModal.status !== 'resolved' && (
              <div className="flex gap-3 pt-2">
                {detailModal.status === 'open' && (
                  <Button variant="secondary" className="flex-1"
                    onClick={() => handleStatusUpdate(detailModal, 'assigned')} id="btn-assign-incident">
                    Marcar asignado
                  </Button>
                )}
                <Button variant="success" className="flex-1"
                  onClick={() => handleStatusUpdate(detailModal, 'resolved')} id="btn-resolve-incident">
                  ✅ Resolver
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}

export default IncidentCenterPage
