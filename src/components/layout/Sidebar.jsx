import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Building2, CheckSquare, Image, AlertTriangle,
  LogOut, Menu, X
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
  { to: '/gerencia/fotos',       icon: Image,           label: 'Fotos' },
  { to: '/gerencia/incidentes',  icon: AlertTriangle,   label: 'Incidentes' },
]

const Sidebar = ({ role }) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { profile, logout }         = useAuthStore()

  const items = role === 'gerencia' ? gerenciaItems : supervisorItems

  const NavItems = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-DEFAULT/15 flex items-center justify-center">
            <Building2 size={16} className="text-accent-DEFAULT" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-textPrimary tracking-tight">LIHUEL</h1>
            <p className="text-[10px] text-muted capitalize">{role}</p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            id={`nav-${label.toLowerCase().replace(/ /g, '-')}`}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-sm
               ${isActive
                 ? 'bg-accent-DEFAULT/10 text-accent-DEFAULT font-medium'
                 : 'text-muted hover:bg-white/5 hover:text-textPrimary'}`
            }
          >
            <Icon size={18} strokeWidth={1.5} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 mb-3">
          <Avatar name={profile?.full_name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-textPrimary truncate">{profile?.full_name}</p>
            <p className="text-[10px] text-muted capitalize">{profile?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          id="btn-logout"
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-muted
                     hover:bg-red-500/10 hover:text-red-400 transition-colors text-sm"
        >
          <LogOut size={16} strokeWidth={1.5} />
          Cerrar sesión
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-card border-r border-border h-screen sticky top-0">
        <NavItems />
      </aside>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        id="btn-mobile-menu"
        className="lg:hidden fixed top-3 left-3 z-50 p-2.5 rounded-xl bg-card/90 backdrop-blur border border-border"
        aria-label="Abrir menú"
      >
        <Menu size={20} className="text-textPrimary" />
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-card h-full flex flex-col animate-slide-down">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 btn-ghost p-2 rounded-xl"
            >
              <X size={18} />
            </button>
            <NavItems />
          </aside>
        </div>
      )}
    </>
  )
}

export default Sidebar
