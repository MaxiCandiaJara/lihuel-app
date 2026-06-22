import { useEffect, useState } from 'react'
import { Search, Plus, Filter } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import ObraCard from '../../components/obras/ObraCard'
import { Input } from '../../components/ui/FormElements'
import { fetchObras } from '../../services/api'
import useAuthStore from '../../store/authStore'

const MisObrasPage = () => {
  const { user, profile } = useAuthStore()
  const [obras, setObras]   = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
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

  const filtered = obras.filter(o => {
    const matchSearch = o.name.toLowerCase().includes(search.toLowerCase()) ||
                        o.location.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || o.status === filter
    return matchSearch && matchFilter
  })

  const filters = [
    { value: 'all',       label: 'Todas' },
    { value: 'active',    label: 'Activas' },
    { value: 'paused',    label: 'Pausadas' },
    { value: 'completed', label: 'Terminadas' },
  ]

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Mis Obras" />

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
        {/* Greeting */}
        <div className="mb-5">
          <p className="text-muted text-sm">Bienvenido,</p>
          <h2 className="text-xl font-extrabold text-textPrimary">
            {profile?.full_name?.split(' ')[0]} 👷
          </h2>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            id="search-obras"
            type="search"
            placeholder="Buscar obra o ubicación..."
            className="input pl-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5">
          {filters.map(f => (
            <button
              key={f.value}
              id={`filter-${f.value}`}
              onClick={() => setFilter(f.value)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all
                ${filter === f.value
                  ? 'bg-accent-DEFAULT text-white shadow-lg shadow-accent-DEFAULT/30'
                  : 'bg-card border border-border text-muted hover:text-textPrimary'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Obras list */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="card h-40 animate-pulse bg-card" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">🏗️</div>
            <p className="text-textSecondary font-semibold">No hay obras</p>
            <p className="text-muted text-sm mt-1">
              {search ? 'Sin resultados para tu búsqueda' : 'No tenés obras asignadas aún'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(obra => (
              <ObraCard key={obra.id} obra={obra} basePath="/maestro" />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MisObrasPage
