import { Users } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

export function GroupCard({ group, onJoin, isMember }) {
  const memberCount = group.group_members?.[0]?.count ?? 0

  return (
    <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium text-text-primary">{group.name}</h3>
        <Badge label={group.type} variant={group.type} />
      </div>
      {group.description && <p className="text-xs text-text-secondary line-clamp-2">{group.description}</p>}
      <div className="flex items-center gap-1.5 text-xs text-text-muted">
        <Users size={13} />
        <span>{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
        {group.max_members && <span>· max {group.max_members}</span>}
      </div>
      {group.users?.full_name && (
        <p className="text-xs text-text-muted">Created by {group.users.full_name}</p>
      )}
      <Button
        variant={isMember ? 'secondary' : 'primary'}
        size="sm"
        onClick={() => !isMember && onJoin(group)}
        disabled={isMember}
        className="mt-auto"
      >
        {isMember ? 'Joined' : 'Join Group'}
      </Button>
    </div>
  )
}
