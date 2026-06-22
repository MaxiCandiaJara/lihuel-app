import { useEffect, useState } from 'react'
import { Image, Building2, X, ZoomIn } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import { Select } from '../../components/ui/FormElements'
import { supabase } from '../../services/supabase'
import { fetchObras } from '../../services/api'
import useAuthStore from '../../store/authStore'
import { STAGE_LABELS } from '../../components/obras/StageList'

const PhotoGalleryPage = () => {
  const { user }           = useAuthStore()
  const [obras, setObras]  = useState([])
  const [photos, setPhotos] = useState([])
  const [obraFilter, setObraFilter] = useState('all')
  const [loading, setLoading]       = useState(true)
  const [lightbox, setLightbox]     = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const obs = await fetchObras(user.id, 'gerencia')
        setObras(obs)

        // Fetch all photos from all stages
        const { data } = await supabase
          .from('stage_photos')
          .select(`
            *,
            stages(stage_type, obra_id, obras(name))
          `)
          .order('created_at', { ascending: false })
        setPhotos(data || [])
      } catch { } finally { setLoading(false) }
    }
    if (user) load()
  }, [user])

  const filtered = obraFilter === 'all'
    ? photos
    : photos.filter(p => p.stages?.obra_id === obraFilter)

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Galería de Fotos" />

      <div className="flex-1 overflow-y-auto px-4 lg:px-6 pt-4 pb-4 space-y-4">
        {/* Filter */}
        <Select id="gallery-obra-filter" value={obraFilter}
          onChange={e => setObraFilter(e.target.value)}>
          <option value="all">Todas las obras</option>
          {obras.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
        </Select>

        <p className="text-xs text-muted">{filtered.length} foto(s)</p>

        {/* Photo grid */}
        {loading ? (
          <div className="grid grid-cols-3 gap-2">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="aspect-square rounded-xl bg-card animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Image size={48} className="text-muted mb-4 opacity-30" />
            <p className="text-textSecondary font-semibold">Sin fotos</p>
            <p className="text-muted text-sm mt-1">Aún no se han subido fotos</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
            {filtered.map(photo => (
              <button
                key={photo.id}
                onClick={() => setLightbox(photo)}
                className="relative aspect-square rounded-xl overflow-hidden bg-surface group"
                id={`photo-${photo.id}`}
              >
                <img
                  src={photo.public_url}
                  alt="Foto de obra"
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors
                                flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <ZoomIn size={24} className="text-white" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white bg-white/10 rounded-full p-2"
            onClick={() => setLightbox(null)}
          >
            <X size={24} />
          </button>
          <div className="text-center" onClick={e => e.stopPropagation()}>
            <img
              src={lightbox.public_url}
              alt="Foto"
              className="max-w-full max-h-[75vh] rounded-xl object-contain"
            />
            <div className="mt-3 text-sm text-white/70 space-y-1">
              {lightbox.stages?.obras?.name && (
                <p>📍 {lightbox.stages.obras.name}</p>
              )}
              {lightbox.stages?.stage_type && (
                <p>🏗️ {STAGE_LABELS[lightbox.stages.stage_type]}</p>
              )}
              <p>🕒 {new Date(lightbox.created_at).toLocaleString('es-AR')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PhotoGalleryPage
