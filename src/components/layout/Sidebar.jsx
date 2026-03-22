import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Rss, Users, Trophy, BarChart2, User, MessageSquare, Shield, X } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const links = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/feed', icon: Rss, label: 'Feed' },
  { to: '/groups', icon: Users, label: 'Groups' },
  { to: '/competitions', icon: Trophy, label: 'Competitions' },
  { to: '/leaderboard', icon: BarChart2, label: 'Leaderboard' },
  { to: '/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export function Sidebar({ mobileOpen = false, onClose }) {
  const { profile } = useAuth()
  const adminLink = { to: '/admin/users', icon: Shield, label: 'All Users' }
  const allLinks = profile?.role === 'admin'
    ? [...links, adminLink]
    : links

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 bg-card border-r border-border min-h-screen sticky top-0">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <img src="/logo2.webp" alt="BitxBase logo" className="h-12 w-12 rounded-lg object-contain" />
            {/* <span className="text-lg font-medium text-primary">BitxBase</span> */}
          </div>
        </div>
        <nav className="flex flex-col gap-1 p-3 flex-1">
          {allLinks.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-highlight text-primary font-medium' : 'text-text-secondary hover:bg-highlight hover:text-text-primary'}`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-card border-r border-border flex flex-col">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/logo2.webp" alt="BitxBase logo" className="h-10 w-10 rounded-lg object-contain" />
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-text-muted hover:text-text-primary hover:border-text-primary transition"
                aria-label="Close menu"
              >
                <X size={16} />
              </button>
            </div>
            <nav className="flex flex-col gap-1 p-3 flex-1">
              {allLinks.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-highlight text-primary font-medium' : 'text-text-secondary hover:bg-highlight hover:text-text-primary'}`
                  }
                >
                  <Icon size={17} />
                  {label}
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  )
}
