import { Users, Clock } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { countdown, formatDate } from '../../utils/formatDate'

export function CompetitionCard({ competition, isRegistered, onRegister, onSubmit }) {
  const participantCount = competition.competition_registrations?.[0]?.count ?? 0
  const isOpen = new Date(competition.deadline) > new Date()

  return (
    <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium text-text-primary">{competition.title}</h3>
        <Badge label={isOpen ? 'open' : 'closed'} variant={isOpen ? 'open' : 'closed'} />
      </div>
      <div className="flex flex-wrap gap-2">
        {competition.category && <Badge label={competition.category} />}
        {competition.difficulty && <Badge label={competition.difficulty} variant={competition.difficulty} />}
      </div>
      <div className="flex items-center gap-4 text-xs text-text-muted">
        <span className="flex items-center gap-1"><Clock size={12} />{countdown(competition.deadline)}</span>
        <span className="flex items-center gap-1"><Users size={12} />{participantCount} entered</span>
      </div>
      <div className="flex items-center justify-between text-xs text-text-secondary">
        {competition.entry_fee > 0
          ? <span>Entry: ₦{competition.entry_fee?.toLocaleString()}</span>
          : <span>Free entry</span>
        }
        {competition.prize && <span className="font-medium text-primary">Prize: {competition.prize}</span>}
      </div>
      <p className="text-xs text-text-muted">Deadline: {formatDate(competition.deadline)}</p>
      {isRegistered
        ? <Button size="sm" variant="secondary" onClick={() => onSubmit(competition)}>Submit Project</Button>
        : <Button size="sm" onClick={() => isOpen && onRegister(competition)} disabled={!isOpen}>
            {isOpen ? 'Register' : 'Closed'}
          </Button>
      }
    </div>
  )
}
