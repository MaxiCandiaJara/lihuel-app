import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthListener } from './hooks/useAuth'
import useAuthStore from './store/authStore'
import RoleLayout from './components/layout/RoleLayout'

// Auth
import LoginPage from './pages/auth/LoginPage'

// Maestro
import MisObrasPage       from './pages/maestro/MisObrasPage'
import ObraDetailPage     from './pages/maestro/ObraDetailPage'
import StageWorkPage      from './pages/maestro/StageWorkPage'
import NotificacionesPage from './pages/maestro/NotificacionesPage'

// Supervisor
import ObrasOverviewPage  from './pages/supervisor/ObrasOverviewPage'
import StageReviewPage    from './pages/supervisor/StageReviewPage'
import IncidentCenterPage from './pages/supervisor/IncidentCenterPage'

// Gerencia
import DashboardPage          from './pages/gerencia/DashboardPage'
import ObrasManagementPage    from './pages/gerencia/ObrasManagementPage'
import ChecklistTemplatePage  from './pages/gerencia/ChecklistTemplatePage'
import PhotoGalleryPage       from './pages/gerencia/PhotoGalleryPage'
// Gerencia reuses supervisor's IncidentCenterPage
import GerenciaObraDetailPage from './pages/maestro/ObraDetailPage'

// Root redirect based on role
const RootRedirect = () => {
  const { profile, loading } = useAuthStore()

  if (loading) return null

  if (!profile) return <Navigate to="/login" replace />

  const routes = {
    maestro:    '/maestro/obras',
    supervisor: '/supervisor/obras',
    gerencia:   '/gerencia/dashboard',
  }
  return <Navigate to={routes[profile.role] || '/login'} replace />
}

const App = () => {
  useAuthListener()

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/"      element={<RootRedirect />} />

        {/* ── MAESTRO ── */}
        <Route element={<RoleLayout requiredRole="maestro" />}>
          <Route path="/maestro/obras"                              element={<MisObrasPage />} />
          <Route path="/maestro/obras/:obraId"                      element={<ObraDetailPage />} />
          <Route path="/maestro/obras/:obraId/etapa/:stageId"       element={<StageWorkPage />} />
          <Route path="/maestro/notificaciones"                     element={<NotificacionesPage />} />
          <Route path="/maestro/*"                                  element={<Navigate to="/maestro/obras" replace />} />
        </Route>

        {/* ── SUPERVISOR ── */}
        <Route element={<RoleLayout requiredRole="supervisor" />}>
          <Route path="/supervisor/obras"                                   element={<ObrasOverviewPage />} />
          <Route path="/supervisor/obras/:obraId"                           element={<ObraDetailPage />} />
          <Route path="/supervisor/obras/:obraId/etapa/:stageId"            element={<StageReviewPage />} />
          <Route path="/supervisor/incidentes"                              element={<IncidentCenterPage />} />
          <Route path="/supervisor/*"                                       element={<Navigate to="/supervisor/obras" replace />} />
        </Route>

        {/* ── GERENCIA ── */}
        <Route element={<RoleLayout requiredRole="gerencia" />}>
          <Route path="/gerencia/dashboard"                          element={<DashboardPage />} />
          <Route path="/gerencia/obras"                              element={<ObrasManagementPage />} />
          <Route path="/gerencia/obras/:obraId"                      element={<GerenciaObraDetailPage />} />
          <Route path="/gerencia/checklist"                          element={<ChecklistTemplatePage />} />
          <Route path="/gerencia/fotos"                              element={<PhotoGalleryPage />} />
          <Route path="/gerencia/incidentes"                         element={<IncidentCenterPage />} />
          <Route path="/gerencia/*"                                  element={<Navigate to="/gerencia/dashboard" replace />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
