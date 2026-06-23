import { NavLink } from 'react-router-dom'
import { LayoutDashboard, TrendingUp, BookOpen, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const iconMap = {
  LayoutDashboard,
  TrendingUp,
  BookOpen,
  Settings,
}

const navItems = [
  { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' as const },
  { label: 'Trades', path: '/trades', icon: 'TrendingUp' as const },
  { label: 'Notes', path: '/notes', icon: 'BookOpen' as const },
  { label: 'Settings', path: '/settings', icon: 'Settings' as const },
]

export function Sidebar() {
  const { signOut, user } = useAuth()

  return (
    <aside className="w-64 bg-dark-800 border-r border-dark-600 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-dark-600">
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <TrendingUp className="text-accent-400" size={24} />
          Forex Journal
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => {
          const Icon = iconMap[item.icon]
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-accent-500/10 text-accent-400'
                    : 'text-dark-200 hover:bg-dark-700 hover:text-dark-100'
                }`
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="p-4 border-t border-dark-600">
        <p className="text-xs text-dark-300 mb-3 truncate">{user?.email}</p>
        <button
          onClick={signOut}
          className="flex items-center gap-2 text-sm text-dark-300 hover:text-red-400 transition-colors w-full cursor-pointer"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
