import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Building2, CheckSquare, Image, AlertTriangle,
  ChevronRight, LogOut, Menu, X
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import Avatar from '../ui/Avatar'

const supervisorItems = [
  { to: '/supervisor/obras',     icon: Building2,      label: 'Obras' },
  { to: '/supervisor/incidentes', icon: AlertTriangle,  label: 'Incidentes' },
]

const gerenciaItems = [
  { to: '/gerencia/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/gerencia/obras',       icon: Building2,       label: 'Obras' },
  { to: '/gerencia/checklist',   icon: CheckSquare,     label: 'Checklist' },
  { to: '/gerencia/fotos',       icon: Image,           label: 'Galería de Fotos' },
  { to: '/gerencia/incidentes',  icon: AlertTriangle,   label: 'Incidentes' },
]

const Sidebar = ({ role }) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { profile, logout }         = useAuthStore()

  const items = role === 'gerencia' ? gerenciaItems : supervisorItems

  const NavItems = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent-DEFAULT flex items-center justify-center">
            <Building2 size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-textPrimary tracking-tight">LIHUEL APP</h1>
            <p className="text-xs text-muted capitalize">{role}</p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            id={`nav-${label.toLowerCase().replace(/ /g, '-')}`}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 font-medium text-sm
               ${isActive
                 ? 'bg-accent-DEFAULT/15 text-accent-DEFAULT border border-accent-DEFAULT/30'
                 : 'text-muted hover:bg-card hover:text-textPrimary'}`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
            <ChevronRight size={14} className="ml-auto opacity-50" />
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 mb-3">
          <Avatar name={profile?.full_name} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-textPrimary truncate">{profile?.full_name}</p>
            <p className="text-xs text-muted capitalize">{profile?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          id="btn-logout"
          className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-muted
                     hover:bg-danger/10 hover:text-danger transition-colors text-sm font-medium"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-card border-r border-border h-screen sticky top-0">
        <NavItems />
      </aside>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        id="btn-mobile-menu"
        className="lg:hidden fixed top-4 left-4 z-50 btn-secondary p-3 rounded-xl shadow-xl"
        aria-label="Abrir menú"
      >
        <Menu size={22} />
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 bg-card h-full flex flex-col animate-slide-down">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 btn-ghost p-2 rounded-xl"
            >
              <X size={20} />
            </button>
            <NavItems />
          </aside>
        </div>
      )}
    </>
  )
}

export default Sidebar
