import { NavLink } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'
import type { EmployeeRole } from '@/types/database'
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  UserCog,
  Wallet,
  Droplets,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
  roles: EmployeeRole[]
}

const navItems: NavItem[] = [
  {
    label: 'Дашборд',
    path: '/',
    icon: <LayoutDashboard size={20} />,
    roles: ['admin', 'operator', 'courier'],
  },
  {
    label: 'Клиенты',
    path: '/clients',
    icon: <Users size={20} />,
    roles: ['admin', 'operator'],
  },
  {
    label: 'Заказы',
    path: '/orders',
    icon: <ClipboardList size={20} />,
    roles: ['admin', 'operator', 'courier'],
  },
  {
    label: 'Сотрудники',
    path: '/employees',
    icon: <UserCog size={20} />,
    roles: ['admin'],
  },
  {
    label: 'Расходы',
    path: '/expenses',
    icon: <Wallet size={20} />,
    roles: ['admin'],
  },
]

export default function Sidebar() {
  const { role } = useAuth()

  const filteredItems = navItems.filter(
    (item) => role && item.roles.includes(role)
  )

  return (
    <aside className="flex flex-col w-64 min-h-screen border-r bg-card">
      {/* Логотип */}
      <div className="flex items-center gap-2 px-6 h-16 border-b">
        <Droplets size={24} className="text-primary" />
        <span className="font-semibold text-lg">Akhali Tskhali Admin</span>
      </div>

      {/* Навигация */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
