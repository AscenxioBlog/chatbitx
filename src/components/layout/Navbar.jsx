import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, Menu } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { Avatar } from '../ui/Avatar'
import { NotificationBell } from '../notifications/NotificationBell'

export function Navbar({ onOpenMenu }) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 bg-card border-b border-border px-4 md:px-6 h-14 flex items-center justify-between">
      <div className="md:hidden flex items-center gap-2">
        <button
          onClick={onOpenMenu}
          className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-text-muted hover:text-text-primary hover:border-text-primary transition"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
        <img src="/logo2.webp" alt="BitxBase logo" className="h-8 w-8 rounded-md object-contain" />
        <span className="text-base font-medium text-primary">BitxBase</span>
      </div>
      <div className="hidden md:block" />
      <div className="flex items-center gap-3">
        <NotificationBell />
        <div className="relative" ref={ref}>
          <button onClick={() => setOpen(o => !o)} className="flex items-center gap-2 hover:bg-highlight rounded-lg px-2 py-1 transition-colors">
            <Avatar src={profile?.avatar_url} name={profile?.full_name} size="sm" />
            <span className="hidden sm:block text-sm text-text-primary font-medium">{profile?.full_name}</span>
            <ChevronDown size={14} className="text-text-muted" />
          </button>
          {open && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-card border border-border rounded-xl shadow-sm py-1 z-50">
              <Link to="/profile" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm text-text-primary hover:bg-highlight transition-colors">Profile</Link>
              <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-highlight transition-colors">Sign out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
