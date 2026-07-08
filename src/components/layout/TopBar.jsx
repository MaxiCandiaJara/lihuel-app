import { ArrowLeft, Wifi, WifiOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useSyncStore from '../../store/syncStore'
import clsx from 'clsx'

const TopBar = ({ title, showBack = false, actions, className }) => {
  const navigate  = useNavigate()
  const isOnline  = useSyncStore(s => s.isOnline)
  const queueCount = useSyncStore(s => s.queue.length)

  return (
    <header
      className={clsx(
        'sticky top-0 z-40 glass border-b border-border px-4 flex items-center gap-3',
        className
      )}
      style={{ minHeight: 56, paddingTop: 'env(safe-area-inset-top)' }}
    >
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          id="btn-back"
          className="btn-ghost p-2 rounded-xl -ml-2"
          aria-label="Volver"
        >
          <ArrowLeft size={20} />
        </button>
      )}

      <h1 className="flex-1 text-sm font-semibold text-textPrimary truncate">{title}</h1>

      {/* Offline indicator */}
      {!isOnline && (
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-warning bg-warning/10">
          <WifiOff size={14} />
          <span>Offline</span>
        </div>
      )}

      {isOnline && queueCount > 0 && (
        <span className="text-xs font-medium text-warning">{queueCount}↑</span>
      )}

      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  )
}

export default TopBar
