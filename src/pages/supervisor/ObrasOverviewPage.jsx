import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import ObraCard from '../../components/obras/ObraCard'
import { fetchObras } from '../../services/api'
import useAuthStore from '../../store/authStore'

const ObrasOverviewPage = () => {
  const { user, profile } = useAuthStore()
  const [obras, setObras]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchObras(user.id, profile.role)
        setObras(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (user && profile) load()
  }, [user, profile])

  const byStatus = (status) => obras.filter(o => o.status === status)

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Supervisión de Obras" />

      <div className="flex-1 overflow-y-auto px-4 lg:px-6 pt-4 pb-4">
        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Activas',    count: byStatus('active').length,    color: 'text-accent-DEFAULT' },
            { label: 'Pausadas',   count: byStatus('paused').length,    color: 'text-warning' },
            { label: 'Terminadas', count: byStatus('completed').length, color: 'text-success' },
          ].map(s => (
            <div key={s.label} className="card p-4 text-center">
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.count}</p>
              <p className="text-xs text-muted mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Obras list */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="card h-40 animate-pulse" />)}
          </div>
        ) : obras.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Building2 size={48} className="text-muted mb-4 opacity-30" />
            <p className="text-textSecondary font-semibold">Sin obras asignadas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {obras.map(obra => (
              <ObraCard key={obra.id} obra={obra} basePath="/supervisor" />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ObrasOverviewPage
