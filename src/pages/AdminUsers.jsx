import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Avatar } from '../components/ui/Avatar'
import { Badge } from '../components/ui/Badge'

export default function AdminUsers() {
  const { profile } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    async function fetchUsers() {
      setLoading(true)
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, role, avatar_url, created_at')
        .order('created_at', { ascending: false })

      if (!ignore) {
        if (error) {
          console.error('fetchUsers error:', error)
          setUsers([])
        } else {
          setUsers(data || [])
        }
        setLoading(false)
      }
    }

    fetchUsers()
    return () => { ignore = true }
  }, [])

  async function handleRoleChange(userId, role) {
    const { error } = await supabase.from('users').update({ role }).eq('id', userId)
    if (error) {
      console.error('update role error:', error)
      return
    }
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, role } : u)))
  }

  if (profile?.role !== 'admin') {
    return (
      <div className="bg-card border border-border rounded-xl p-6 text-sm text-text-muted">
        You don’t have permission to view this page.
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">All Users</h1>
          <p className="text-sm text-text-muted">Manage user roles</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <p className="text-sm text-text-muted p-4">Loading users...</p>
        ) : (
          <div className="divide-y divide-border">
            {users.map(user => (
              <div key={user.id} className="flex items-center gap-3 p-4">
                <Avatar src={user.avatar_url} name={user.full_name} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{user.full_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge label={user.role} variant={user.role} />
                    <span className="text-xs text-text-muted">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  className="text-sm border border-border rounded-lg bg-card px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
