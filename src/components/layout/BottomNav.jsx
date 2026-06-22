import { NavLink } from 'react-router-dom'
import { Home, Bell } from 'lucide-react'
import useNotifications from '../../hooks/useNotifications'

const BottomNav = () => {
  const { unreadCount } = useNotifications()

  const items = [
    { to: '/maestro/obras',          icon: Home,  label: 'Mis Obras' },
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
            <Icon size={24} />
            {badge > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-danger
                               text-white text-[10px] font-bold rounded-full flex items-center
                               justify-center px-0.5 animate-pulse-dot">
                {badge > 99 ? '99+' : badge}
              </span>
            )}
          </div>
          <span className="text-xs font-medium">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export default BottomNav
