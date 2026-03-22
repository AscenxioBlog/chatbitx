import { useState } from 'react'
import { ThumbsUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

export function VoteButton({ submission, onVoted }) {
  const { profile } = useAuth()
  const [voted, setVoted] = useState(submission.voted_by_me || false)
  const [count, setCount] = useState(submission.vote_count || 0)
  const [loading, setLoading] = useState(false)

  const isOwn = submission.user_id === profile?.id

  async function handleVote() {
    if (loading || voted || isOwn) return
    setLoading(true)
    const { error } = await supabase.from('votes').insert({ submission_id: submission.id, voter_id: profile.id })
    setLoading(false)
    if (error) { toast.error('Could not vote'); return }
    setVoted(true)
    setCount(c => c + 1)
    onVoted?.()
  }

  return (
    <button
      onClick={handleVote}
      disabled={voted || isOwn || loading}
      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${voted ? 'bg-primary/10 text-primary border-primary/20' : 'border-border text-text-muted hover:border-primary hover:text-primary'} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <ThumbsUp size={13} fill={voted ? 'currentColor' : 'none'} />
      {count} {count === 1 ? 'vote' : 'votes'}
    </button>
  )
}
