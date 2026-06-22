import { useEffect, useState } from 'react'
import { BarChart2, Building2, AlertTriangle, Clock, TrendingUp } from 'lucide-react'
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
  <div className="card p-5 flex items-start gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color.replace('text-', 'bg-')}/20`}>
      <Icon size={24} className={color} />
    </div>
    <div>
      <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
      <p className="text-sm font-semibold text-textPrimary">{label}</p>
      {sub && <p className="text-xs text-muted mt-0.5">{sub}</p>}
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

  // Pie chart data — incidents by severity
  const pieData = [
    { name: 'Alta',  value: incidents.filter(i => i.severity === 'high').length,   color: '#EF4444' },
    { name: 'Media', value: incidents.filter(i => i.severity === 'medium').length, color: '#F59E0B' },
    { name: 'Baja',  value: incidents.filter(i => i.severity === 'low').length,    color: '#22C55E' },
  ].filter(d => d.value > 0)

  // Bar chart — obra completion
  const barData = obras.slice(0, 5).map(o => ({
    name: o.name.length > 16 ? o.name.slice(0, 14) + '…' : o.name,
    progreso: calcProgress(o.stages),
  }))

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Dashboard" />
        <div className="flex-1 px-4 lg:px-6 pt-4 grid grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="card h-28 animate-pulse" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Dashboard de Gerencia" />

      <div className="flex-1 overflow-y-auto px-4 lg:px-6 pt-4 pb-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <KPICard icon={Building2}     label="Obras activas"          value={active}   color="text-accent-DEFAULT" />
          <KPICard icon={Clock}         label="Obras atrasadas"         value={behind}   color="text-warning"        sub="Superaron fecha estimada" />
          <KPICard icon={AlertTriangle} label="Incidentes abiertos"     value={openInc}  color="text-danger"         sub={`${openHigh} de alta severidad`} />
          <KPICard icon={TrendingUp}    label="Obras completadas"       value={obras.filter(o => o.status === 'completed').length} color="text-success" />
        </div>

        {/* Obra progress bars */}
        <div className="card p-5">
          <h3 className="text-base font-bold text-textPrimary mb-4 flex items-center gap-2">
            <BarChart2 size={18} className="text-accent-DEFAULT" />
            Progreso por obra
          </h3>
          <div className="space-y-4">
            {obras.map(o => {
              const pct = calcProgress(o.stages)
              return (
                <div key={o.id}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-textSecondary font-medium truncate max-w-[70%]">{o.name}</span>
                    <span className="font-bold text-accent-DEFAULT">{pct}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recharts bar */}
          {barData.length > 0 && (
            <div className="card p-5">
              <h3 className="text-sm font-bold text-textSecondary uppercase tracking-wide mb-4">
                Completitud (%) por obra
              </h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={barData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8 }}
                    labelStyle={{ color: '#F8FAFC' }}
                    formatter={(v) => [`${v}%`, 'Progreso']}
                  />
                  <Bar dataKey="progreso" fill="#F97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Pie chart — incidents */}
          {pieData.length > 0 && (
            <div className="card p-5">
              <h3 className="text-sm font-bold text-textSecondary uppercase tracking-wide mb-4">
                Incidentes por severidad
              </h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={{ stroke: '#94A3B8' }}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8 }}
                    labelStyle={{ color: '#F8FAFC' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Stage breakdown table */}
        <div className="card p-5 overflow-x-auto">
          <h3 className="text-sm font-bold text-textSecondary uppercase tracking-wide mb-4">
            Estado de etapas por obra
          </h3>
          <table className="w-full text-xs min-w-[600px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 text-muted font-semibold">Obra</th>
                {Object.values(STAGE_LABELS_SHORT).map(l => (
                  <th key={l} className="text-center py-2 px-1 text-muted font-semibold">{l}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {obras.map(o => (
                <tr key={o.id} className="border-b border-border/50 hover:bg-surface/50">
                  <td className="py-3 pr-4 font-medium text-textPrimary truncate max-w-[140px]">{o.name}</td>
                  {Object.keys(STAGE_LABELS_SHORT).map(type => {
                    const st = o.stages?.find(s => s.stage_type === type)
                    return (
                      <td key={type} className="text-center py-3 px-1">
                        {st?.status === 'approved'  ? '✅' :
                         st?.status === 'in_review' ? '🟡' :
                         st?.status === 'rejected'  ? '❌' : '⬜'}
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
