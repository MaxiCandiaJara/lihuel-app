import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import clsx from 'clsx'

const icons = {
  success: CheckCircle,
  error:   XCircle,
  info:    Info,
  warning: AlertTriangle,
}

const colors = {
  success: 'border-success/50 bg-success/10 text-success',
  error:   'border-danger/50 bg-danger/10 text-danger',
  info:    'border-accent-DEFAULT/50 bg-accent-DEFAULT/10 text-accent-DEFAULT',
  warning: 'border-warning/50 bg-warning/10 text-warning',
}

export let showToast = () => {}

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    showToast = (message, type = 'info', duration = 4000) => {
      const id = Date.now()
      setToasts(prev => [...prev, { id, message, type }])
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, duration)
    }
  }, [])

  const remove = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
      {toasts.map(toast => {
        const Icon = icons[toast.type] || Info
        return (
          <div
            key={toast.id}
            className={clsx(
              'flex items-start gap-3 p-4 rounded-xl border shadow-xl animate-slide-down',
              colors[toast.type]
            )}
          >
            <Icon size={18} className="shrink-0 mt-0.5" />
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button onClick={() => remove(toast.id)} className="shrink-0 hover:opacity-70">
              <X size={16} />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export default ToastContainer
