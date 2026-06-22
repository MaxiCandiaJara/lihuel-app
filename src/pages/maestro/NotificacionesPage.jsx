import { Bell, CheckCheck } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import Button from '../../components/ui/Button'
import useNotifications from '../../hooks/useNotifications'
import clsx from 'clsx'

const NotificacionesPage = () => {
  const { notifications, loading, markRead, markAllRead, unreadCount } = useNotifications()

  const iconFor = (type) => ({
    stage_approved:  '✅',
    stage_rejected:  '❌',
    stage_submitted: '📋',
    incident_high:   '🚨',
  })[type] || '🔔'

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Notificaciones"
        actions={
          unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllRead} id="btn-mark-all-read">
              <CheckCheck size={16} />
              Marcar todo leído
            </Button>
          )
        }
      />

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="card h-20 animate-pulse" />)}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Bell size={48} className="text-muted mb-4 opacity-30" />
            <p className="text-textSecondary font-semibold">Sin notificaciones</p>
            <p className="text-muted text-sm mt-1">Te avisaremos cuando haya novedades</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => (
              <button
                key={n.id}
                id={`notification-${n.id}`}
                onClick={() => !n.read && markRead(n.id)}
                className={clsx(
                  'w-full text-left card p-4 flex gap-4 transition-all',
                  !n.read && 'border-accent-DEFAULT/40 bg-accent-DEFAULT/5'
                )}
              >
                <div className="text-2xl shrink-0 mt-0.5">{iconFor(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-textPrimary">{n.title}</p>
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full bg-accent-DEFAULT shrink-0 mt-1.5 animate-pulse-dot" />
                    )}
                  </div>
                  <p className="text-xs text-muted mt-0.5 line-clamp-2">{n.body}</p>
                  <p className="text-xs text-muted/60 mt-1">
                    {new Date(n.created_at).toLocaleString('es-AR')}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificacionesPage
