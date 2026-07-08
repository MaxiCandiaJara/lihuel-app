import { NavLink } from 'react-router-dom'
import { Home, Bell, LogOut } from 'lucide-react'
import useNotifications from '../../hooks/useNotifications'
import useAuthStore from '../../store/authStore'

const BottomNav = () => {
  const { unreadCount } = useNotifications()
  const { logout } = useAuthStore()

  const items = [
    { to: '/maestro/obras',          icon: Home,  label: 'Obras' },
    { to: '/maestro/notificaciones', icon: Bell,  label: 'Avisos',  badge: unreadCount },
  ]

  return (
    <nav className="bottom-nav">
      {items.map(({ to, icon: Icon, label, badge }) => (
        <NavLink
          key={to}
          to={to}
          id={`nav-${label.toLowerCase().replace(' ', '-')}`}
          className={({ isActive }) =>
            `bottom-nav-item${isActive ? ' active' : ''}`
          }
        >
          <div className="relative">
            <Icon size={22} strokeWidth={1.5} />
            {badge > 0 && (
              <span className="absolute -top-1 -right-2 min-w-[16px] h-[16px] bg-danger
                               text-white text-[9px] font-bold rounded-full flex items-center
                               justify-center px-0.5">
                {badge > 99 ? '99+' : badge}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium mt-0.5">{label}</span>
        </NavLink>
      ))}
      <button
        onClick={logout}
        id="nav-logout"
        className="bottom-nav-item"
      >
        <LogOut size={22} strokeWidth={1.5} />
        <span className="text-[10px] font-medium mt-0.5">Salir</span>
      </button>
    </nav>
  )
}

export default BottomNav
