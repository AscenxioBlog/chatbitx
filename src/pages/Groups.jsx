import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useGroups } from '../hooks/useGroups'
import { useAuth } from '../hooks/useAuth'
import { GroupCard } from '../components/groups/GroupCard'
import { JoinGroupModal } from '../components/groups/JoinGroupModal'
import { CreateGroupModal } from '../components/groups/CreateGroupModal'
import { Button } from '../components/ui/Button'
import { supabase } from '../lib/supabase'
import { useEffect } from 'react'

export default function Groups() {
  const { groups, loading, refresh } = useGroups()
  const { profile } = useAuth()
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [memberGroupIds, setMemberGroupIds] = useState(new Set())

  const canCreate = profile?.role === 'instructor' || profile?.role === 'admin'

  useEffect(() => {
    if (!profile) return
    supabase.from('group_members').select('group_id').eq('user_id', profile.id)
      .then(({ data }) => setMemberGroupIds(new Set(data?.map(m => m.group_id) || [])))
  }, [profile])

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium text-text-primary">Groups</h1>
        {canCreate && (
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus size={15} /> Create Group
          </Button>
        )}
      </div>

      {loading
        ? <p className="text-sm text-text-muted">Loading groups...</p>
        : groups.length === 0
          ? <p className="text-sm text-text-muted">No groups yet.</p>
          : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map(group => (
                <GroupCard
                  key={group.id}
                  group={group}
                  isMember={memberGroupIds.has(group.id)}
                  onJoin={setSelectedGroup}
                />
              ))}
            </div>
          )
      }

      {selectedGroup && (
        <JoinGroupModal
          group={selectedGroup}
          open={!!selectedGroup}
          onClose={() => setSelectedGroup(null)}
          onJoined={() => { refresh(); setMemberGroupIds(prev => new Set([...prev, selectedGroup.id])) }}
        />
      )}

      <CreateGroupModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={refresh}
      />
    </div>
  )
}
