import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { usePosts } from '../hooks/usePosts'
import { PostCard } from '../components/feed/PostCard'
import { CreatePost } from '../components/feed/CreatePost'
import { GroupChat } from '../components/groups/GroupChat'
import { Avatar } from '../components/ui/Avatar'
import { Badge } from '../components/ui/Badge'

export default function GroupDetail() {
  const { id } = useParams()
  const { profile } = useAuth()
  const [group, setGroup] = useState(null)
  const [members, setMembers] = useState([])
  const [isMember, setIsMember] = useState(false)
  const { posts, loading, refresh } = usePosts(id)

  useEffect(() => {
    async function load() {
      const [groupRes, membersRes] = await Promise.all([
        supabase.from('groups').select('*, users(full_name)').eq('id', id).single(),
        supabase.from('group_members').select('*, users(id, full_name, role, avatar_url)').eq('group_id', id),
      ])
      setGroup(groupRes.data)
      setMembers(membersRes.data || [])
      setIsMember(membersRes.data?.some(m => m.user_id === profile?.id) || false)
    }
    load()
  }, [id, profile])

  if (!group) return <p className="text-sm text-text-muted">Loading...</p>

  return (
    <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 flex flex-col gap-4">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="text-lg font-medium text-text-primary">{group.name}</h1>
              {group.description && <p className="text-sm text-text-secondary mt-1">{group.description}</p>}
            </div>
            <Badge label={group.type} variant={group.type} />
          </div>
          {group.users?.full_name && <p className="text-xs text-text-muted mt-2">Created by {group.users.full_name}</p>}
        </div>

        {isMember && <CreatePost groupId={id} onCreated={refresh} />}

        {loading
          ? <p className="text-sm text-text-muted">Loading posts...</p>
          : posts.length === 0
            ? <p className="text-sm text-text-muted text-center py-8">No posts in this group yet.</p>
            : posts.map(p => <PostCard key={p.id} post={p} />)
        }

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-medium text-text-primary mb-4">Members ({members.length})</h2>
          <div className="flex flex-col gap-3">
            {members.map(m => (
              <div key={m.id} className="flex items-center gap-3">
                <Avatar src={m.users?.avatar_url} name={m.users?.full_name} size="sm" />
                <span className="text-sm text-text-primary">{m.users?.full_name}</span>
                <Badge label={m.users?.role} variant={m.users?.role} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl flex flex-col" style={{ height: '600px' }}>
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-medium text-text-primary">Group Chat</h2>
        </div>
        {isMember
          ? <GroupChat groupId={id} />
          : <p className="text-sm text-text-muted text-center p-6">Join this group to access the chat.</p>
        }
      </div>
    </div>
  )
}
