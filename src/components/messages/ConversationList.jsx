import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { useMessages } from '../../hooks/useMessages'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'

export default function ConversationList({ onSelect, selectedId }) {
  const { profile } = useAuth()
  const { conversations } = useMessages(null)
  const [allUsers, setAllUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)

  useEffect(() => {
    let ignore = false
    async function fetchUsers() {
      if (!profile) return
      setLoadingUsers(true)
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, role, avatar_url')
        .neq('id', profile.id)
        .order('full_name', { ascending: true })

      if (!ignore) {
        if (error) {
          console.error('fetchUsers error:', error)
          setAllUsers([])
        } else {
          setAllUsers(data || [])
        }
        setLoadingUsers(false)
      }
    }

    fetchUsers()
    return () => { ignore = true }
  }, [profile])

  return (
    <div className="w-full md:w-80 shrink-0 border-b md:border-b-0 md:border-r border-border flex flex-col bg-card">
      <div className="px-4 pt-4 pb-3 border-b border-border bg-gradient-to-r from-highlight to-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Inbox</p>
            <h2 className="text-lg font-semibold text-text-primary mt-1">Messages</h2>
          </div>
          <button className="text-xs font-medium px-3 py-1.5 rounded-full bg-primary text-white hover:bg-primary-hover transition">
            New
          </button>
        </div>
        <div className="mt-3 flex items-center gap-2 bg-surface border border-border rounded-full px-3 py-2">
          <Search size={16} className="text-text-muted" />
          <input
            placeholder="Search messages"
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          />
        </div>
        <div className="mt-3">
          <label className="text-[11px] text-text-muted">Start a new chat</label>
          <select
            value={selectedId || ''}
            onChange={(e) => {
              const picked = allUsers.find(u => u.id === e.target.value)
              if (picked) onSelect(picked)
            }}
            className="mt-1 w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          >
            <option value="">Select a user...</option>
            {allUsers.map(user => (
              <option key={user.id} value={user.id}>
                {user.full_name} ({user.role})
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs">
          <button className="px-3 py-1.5 rounded-full bg-text-primary text-white">All</button>
          <button className="px-3 py-1.5 rounded-full border border-border text-text-muted hover:text-text-primary hover:border-text-primary transition">
            Unread
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 bg-surface">
        {conversations.length === 0 ? (
          <div className="py-6">
            <p className="text-xs text-text-muted text-center">No conversations yet</p>
            <div className="mt-5">
              <p className="text-xs font-medium text-text-primary px-2">All users</p>
              {loadingUsers && (
                <p className="text-xs text-text-muted px-2 mt-2">Loading users...</p>
              )}
              {!loadingUsers && allUsers.length === 0 && (
                <p className="text-xs text-text-muted px-2 mt-2">No other users found</p>
              )}
              <div className="mt-2 flex flex-col gap-2">
                {allUsers.map(user => (
                  <button
                    key={user.id}
                    onClick={() => onSelect(user)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-card hover:bg-card/90 transition text-left border border-border"
                  >
                    <Avatar src={user.avatar_url} name={user.full_name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-text-primary truncate">{user.full_name}</p>
                        <Badge label={user.role} variant={user.role} />
                      </div>
                      <p className="text-xs text-text-muted truncate mt-0.5">Start a conversation</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : conversations.map(({ partner, lastMessage }) => (
          <button
            key={partner.id}
            onClick={() => onSelect(partner)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-card/90 transition text-left border border-transparent ${selectedId === partner.id ? 'bg-card shadow-sm border-border' : 'bg-card/70'}`}
          >
            <Avatar src={partner.avatar_url} name={partner.full_name} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium text-text-primary truncate">{partner.full_name}</p>
                <Badge label={partner.role} variant={partner.role} />
              </div>
              <p className="text-xs text-text-muted truncate mt-0.5">
                {lastMessage.image_url && !lastMessage.content ? 'Sent an image' : lastMessage.content}
              </p>
            </div>
            {!lastMessage.is_read && lastMessage.receiver_id === profile?.id && (
              <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
