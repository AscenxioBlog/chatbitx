import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'

export function ProtectedRoute() {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
  return user ? <Outlet /> : <Navigate to="/login" replace />
}
