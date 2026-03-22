import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onOpenMenu={() => setMobileOpen(true)} />
        <main className="flex-1 p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
