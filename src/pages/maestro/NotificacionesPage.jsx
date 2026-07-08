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
              <CheckCheck size={14} />
              Marcar leído
            </Button>
          )
        }
      />

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => <div key={i} className="card h-16 animate-pulse" />)}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Bell size={36} className="text-muted mb-3 opacity-20" />
            <p className="text-textSecondary text-sm font-medium">Sin notificaciones</p>
            <p className="text-muted text-xs mt-1">Te avisaremos cuando haya novedades</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {notifications.map(n => (
              <button
                key={n.id}
                id={`notification-${n.id}`}
                onClick={() => !n.read && markRead(n.id)}
                className={clsx(
                  'w-full text-left card p-3.5 flex gap-3 transition-all',
                  !n.read && 'border-accent-DEFAULT/30 bg-accent-DEFAULT/5'
                )}
              >
                <div className="text-lg shrink-0">{iconFor(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-medium text-textPrimary">{n.title}</p>
                    {!n.read && (
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-DEFAULT shrink-0 mt-1.5 animate-pulse-dot" />
                    )}
                  </div>
                  <p className="text-[11px] text-muted mt-0.5 line-clamp-2">{n.body}</p>
                  <p className="text-[10px] text-muted/50 mt-1">
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
