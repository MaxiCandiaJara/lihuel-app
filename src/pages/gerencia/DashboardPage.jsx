import { useEffect, useState } from 'react'
import { Building2, AlertTriangle, Clock, TrendingUp } from 'lucide-react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import TopBar from '../../components/layout/TopBar'
import { fetchObras, fetchIncidents } from '../../services/api'
import useAuthStore from '../../store/authStore'

const STAGE_LABELS_SHORT = {
  obra_gruesa:               'O.Gruesa',
  instalaciones_electricas:  'Eléctrica',
  instalaciones_sanitarias:  'Sanitaria',
  terminaciones:             'Terminac.',
  paisajismo_exteriores:     'Paisaje',
  inspeccion_final:          'Inspección',
}

const KPICard = ({ icon: Icon, label, value, sub, color = 'text-accent-DEFAULT' }) => (
  <div className="card p-4 flex items-center gap-3">
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color.replace('text-', 'bg-')}/10`}>
      <Icon size={18} className={color} strokeWidth={1.5} />
    </div>
    <div>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  </div>
)

const calcProgress = (stages = []) => {
  if (!stages.length) return 0
  return Math.round((stages.filter(s => s.status === 'approved').length / stages.length) * 100)
}

const DashboardPage = () => {
  const { user } = useAuthStore()
  const [obras, setObras]       = useState([])
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [obs, inc] = await Promise.all([
          fetchObras(user.id, 'gerencia'),
          fetchIncidents(),
        ])
        setObras(obs); setIncidents(inc)
      } catch { } finally { setLoading(false) }
    }
    if (user) load()
  }, [user])

  const active    = obras.filter(o => o.status === 'active').length
  const behind    = obras.filter(o => {
    const past = new Date(o.estimated_end_date) < new Date()
    return past && o.status !== 'completed'
  }).length
  const openHigh  = incidents.filter(i => i.severity === 'high' && i.status !== 'resolved').length
  const openInc   = incidents.filter(i => i.status !== 'resolved').length

  // Pie chart data
  const pieData = [
    { name: 'Alta',  value: incidents.filter(i => i.severity === 'high').length,   color: '#ef4444' },
    { name: 'Media', value: incidents.filter(i => i.severity === 'medium').length, color: '#f59e0b' },
    { name: 'Baja',  value: incidents.filter(i => i.severity === 'low').length,    color: '#10b981' },
  ].filter(d => d.value > 0)

  // Bar chart
  const barData = obras.slice(0, 5).map(o => ({
    name: o.name.length > 14 ? o.name.slice(0, 12) + '…' : o.name,
    progreso: calcProgress(o.stages),
  }))

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Dashboard" />
        <div className="flex-1 px-4 lg:px-6 pt-4 grid grid-cols-2 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="card h-24 animate-pulse" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Dashboard" />

      <div className="flex-1 overflow-y-auto px-4 lg:px-6 pt-4 pb-6 space-y-5">
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3">
          <KPICard icon={Building2}     label="Obras activas"      value={active}   color="text-accent-DEFAULT" />
          <KPICard icon={Clock}         label="Atrasadas"          value={behind}   color="text-warning" />
          <KPICard icon={AlertTriangle} label="Incidentes"         value={openInc}  color="text-danger" />
          <KPICard icon={TrendingUp}    label="Completadas"        value={obras.filter(o => o.status === 'completed').length} color="text-success" />
        </div>

        {/* Obra progress bars */}
        <div className="card p-4">
          <h3 className="text-xs font-medium text-muted mb-4">Progreso por obra</h3>
          <div className="space-y-3">
            {obras.map(o => {
              const pct = calcProgress(o.stages)
              return (
                <div key={o.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-textSecondary truncate max-w-[70%]">{o.name}</span>
                    <span className="font-semibold text-accent-DEFAULT">{pct}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {barData.length > 0 && (
            <div className="card p-4">
              <h3 className="text-xs font-medium text-muted mb-4">Completitud por obra</h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={barData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d3d" />
                  <XAxis dataKey="name" tick={{ fill: '#7b8ca3', fontSize: 9 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#7b8ca3', fontSize: 9 }} />
                  <Tooltip
                    contentStyle={{ background: '#151e2e', border: '1px solid #1e2d3d', borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: '#e8edf3' }}
                    formatter={(v) => [`${v}%`, 'Progreso']}
                  />
                  <Bar dataKey="progreso" fill="#ff5a1f" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {pieData.length > 0 && (
            <div className="card p-4">
              <h3 className="text-xs font-medium text-muted mb-4">Incidentes por severidad</h3>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={{ stroke: '#7b8ca3' }}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#151e2e', border: '1px solid #1e2d3d', borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: '#e8edf3' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Stage breakdown table */}
        <div className="card p-4 overflow-x-auto">
          <h3 className="text-xs font-medium text-muted mb-4">Estado de etapas</h3>
          <table className="w-full text-xs min-w-[600px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 text-muted font-medium">Obra</th>
                {Object.values(STAGE_LABELS_SHORT).map(l => (
                  <th key={l} className="text-center py-2 px-1 text-muted font-medium">{l}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {obras.map(o => (
                <tr key={o.id} className="border-b border-border/50">
                  <td className="py-2.5 pr-4 text-textPrimary truncate max-w-[140px]">{o.name}</td>
                  {Object.keys(STAGE_LABELS_SHORT).map(type => {
                    const st = o.stages?.find(s => s.stage_type === type)
                    const statusDot = {
                      approved:  'bg-success',
                      in_review: 'bg-warning',
                      rejected:  'bg-danger',
                      pending:   'bg-border',
                    }
                    return (
                      <td key={type} className="text-center py-2.5 px-1">
                        <div className={`w-2 h-2 rounded-full mx-auto ${statusDot[st?.status] || 'bg-border'}`} />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
