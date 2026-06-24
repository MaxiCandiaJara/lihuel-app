import { ArrowLeft, Wifi, WifiOff, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useSyncStore from '../../store/syncStore'
import useAuthStore from '../../store/authStore'
import clsx from 'clsx'

const TopBar = ({ title, showBack = false, actions, className }) => {
  const navigate  = useNavigate()
  const isOnline  = useSyncStore(s => s.isOnline)
  const queueCount = useSyncStore(s => s.queue.length)
  const { logout } = useAuthStore()

  return (
    <header
      className={clsx(
        'sticky top-0 z-40 glass border-b border-border px-4 flex items-center gap-3',
        className
      )}
      style={{ minHeight: 60, paddingTop: 'env(safe-area-inset-top)' }}
    >
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          id="btn-back"
          className="btn-ghost p-2 rounded-xl -ml-2"
          aria-label="Volver"
        >
          <ArrowLeft size={22} />
        </button>
      )}

      <h1 className="flex-1 text-base font-bold text-textPrimary truncate">{title}</h1>

      {/* Offline indicator */}
      <div
        className={clsx(
          'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-colors',
          isOnline ? 'text-success' : 'text-warning bg-warning/10'
        )}
        title={isOnline ? 'En línea' : `Sin conexión — ${queueCount} pendiente(s)`}
      >
        {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
        {!isOnline && <span>Offline</span>}
        {isOnline && queueCount > 0 && (
          <span className="text-warning">{queueCount}↑</span>
        )}
      </div>

      {actions && <div className="flex items-center gap-2">{actions}</div>}
      
      <button
        onClick={logout}
        id="btn-topbar-logout"
        className="btn-ghost p-2 rounded-xl text-muted hover:text-danger hover:bg-danger/10 transition-colors ml-1"
        aria-label="Cerrar sesión"
        title="Cerrar sesión"
      >
        <LogOut size={20} />
      </button>
    </header>
  )
}

export default TopBar
