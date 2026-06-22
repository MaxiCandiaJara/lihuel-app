import { Outlet, Navigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import BottomNav from './BottomNav'
import Sidebar from './Sidebar'
import { ToastContainer } from '../ui/Toast'
import useOfflineSync from '../../hooks/useOfflineSync'
import useSyncStore from '../../store/syncStore'
import clsx from 'clsx'

const RoleLayout = ({ requiredRole }) => {
  const { profile, loading } = useAuthStore()
  const { isOnline }         = useOfflineSync()
  const queueCount           = useSyncStore(s => s.queue.length)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-accent-DEFAULT flex items-center justify-center animate-pulse">
            <span className="text-2xl">🏗️</span>
          </div>
          <p className="text-muted text-sm">Cargando LIHUEL APP...</p>
        </div>
      </div>
    )
  }

  if (!profile) return <Navigate to="/login" replace />

  if (requiredRole && profile.role !== requiredRole) {
    const defaultRoutes = {
      maestro:    '/maestro/obras',
      supervisor: '/supervisor/obras',
      gerencia:   '/gerencia/dashboard',
    }
    return <Navigate to={defaultRoutes[profile.role] || '/login'} replace />
  }

  const isMaestro = profile.role === 'maestro'

  return (
    <div className={clsx('flex h-full', !isMaestro && 'flex-row')}>
      {/* Sidebar for Supervisor/Gerencia */}
      {!isMaestro && <Sidebar role={profile.role} />}

      {/* Main content */}
      <div className={clsx(
        'flex-1 flex flex-col min-w-0',
        isMaestro && 'pb-20',  // space for bottom nav
      )}>
        {/* Offline banner */}
        {!isOnline && (
          <div className="offline-banner">
            📡 Sin conexión — {queueCount > 0 ? `${queueCount} envío(s) en cola` : 'Modo offline activo'}
          </div>
        )}

        <Outlet />
      </div>

      {/* Bottom nav for Maestro */}
      {isMaestro && <BottomNav />}

      {/* Global toast container */}
      <ToastContainer />
    </div>
  )
}

export default RoleLayout
