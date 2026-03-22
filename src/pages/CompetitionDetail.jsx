import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Badge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'
import { VoteButton } from '../components/competitions/VoteButton'
import { countdown, formatDate } from '../utils/formatDate'

const TABS = ['Overview', 'Submissions', 'Leaderboard']

export default function CompetitionDetail() {
  const { id } = useParams()
  const { profile } = useAuth()
  const [competition, setCompetition] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [tab, setTab] = useState('Overview')
  const [votedIds, setVotedIds] = useState(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [compRes, subsRes, votesRes] = await Promise.all([
        supabase.from('competitions').select('*').eq('id', id).single(),
        supabase.from('submissions').select('*, users(id, full_name, avatar_url), votes(count)').eq('competition_id', id),
        profile ? supabase.from('votes').select('submission_id').eq('voter_id', profile.id) : { data: [] },
      ])
      setCompetition(compRes.data)
      setSubmissions(subsRes.data || [])
      setVotedIds(new Set(votesRes.data?.map(v => v.submission_id) || []))
      setLoading(false)
    }
    load()
  }, [id, profile])

  async function setScore(submissionId, score) {
    await supabase.from('submissions').update({ instructor_score: parseInt(score) }).eq('id', submissionId)
    setSubmissions(prev => prev.map(s => s.id === submissionId ? { ...s, instructor_score: parseInt(score) } : s))
  }

  if (loading) return <p className="text-sm text-text-muted">Loading...</p>
  if (!competition) return <p className="text-sm text-text-muted">Competition not found.</p>

  const isInstructor = profile?.role === 'instructor' || profile?.role === 'admin'
  const isOpen = new Date(competition.deadline) > new Date()
  const sortedSubs = [...submissions].sort((a, b) => (b.votes?.[0]?.count || 0) - (a.votes?.[0]?.count || 0))

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-medium text-text-primary">{competition.title}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              {competition.category && <Badge label={competition.category} />}
              {competition.difficulty && <Badge label={competition.difficulty} variant={competition.difficulty} />}
              <Badge label={isOpen ? 'open' : 'closed'} variant={isOpen ? 'open' : 'closed'} />
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-medium text-primary">{competition.prize}</p>
            <p className="text-xs text-text-muted mt-1">{countdown(competition.deadline)}</p>
            <p className="text-xs text-text-muted">Due {formatDate(competition.deadline)}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-1 border-b border-border">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm transition-colors border-b-2 -mb-px ${tab === t ? 'border-primary text-primary font-medium' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-4">
          <div>
            <h2 className="text-sm font-medium text-text-primary mb-2">Description</h2>
            <p className="text-sm text-text-secondary whitespace-pre-wrap">{competition.description || 'No description provided.'}</p>
          </div>
          {competition.rules && (
            <div>
              <h2 className="text-sm font-medium text-text-primary mb-2">Rules</h2>
              <p className="text-sm text-text-secondary whitespace-pre-wrap">{competition.rules}</p>
            </div>
          )}
          {competition.prize_breakdown && (
            <div>
              <h2 className="text-sm font-medium text-text-primary mb-2">Prize Breakdown</h2>
              <p className="text-sm text-text-secondary whitespace-pre-wrap">{competition.prize_breakdown}</p>
            </div>
          )}
        </div>
      )}

      {tab === 'Submissions' && (
        <div className="flex flex-col gap-4">
          {submissions.length === 0
            ? <p className="text-sm text-text-muted text-center py-8">No submissions yet.</p>
            : submissions.map(sub => (
              <div key={sub.id} className="bg-card border border-border rounded-xl p-6 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Avatar src={sub.users?.avatar_url} name={sub.users?.full_name} size="sm" />
                  <span className="text-sm font-medium text-text-primary">{sub.users?.full_name}</span>
                </div>
                <p className="text-sm text-text-secondary">{sub.description}</p>
                <div className="flex flex-wrap gap-2">
                  {sub.github_url && (
                    <a href={sub.github_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-primary hover:underline">
                      <ExternalLink size={12} /> GitHub
                    </a>
                  )}
                  {sub.demo_url && (
                    <a href={sub.demo_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-primary hover:underline">
                      <ExternalLink size={12} /> Live Demo
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <VoteButton
                    submission={{ ...sub, vote_count: sub.votes?.[0]?.count || 0, voted_by_me: votedIds.has(sub.id) }}
                    onVoted={() => setVotedIds(prev => new Set([...prev, sub.id]))}
                  />
                  {sub.instructor_score != null && (
                    <span className="text-xs text-text-muted">Score: <strong className="text-text-primary">{sub.instructor_score}/100</strong></span>
                  )}
                  {isInstructor && (
                    <div className="flex items-center gap-2 ml-auto">
                      <label className="text-xs text-text-muted">Score:</label>
                      <input
                        type="number" min="0" max="100"
                        defaultValue={sub.instructor_score ?? ''}
                        onBlur={e => setScore(sub.id, e.target.value)}
                        className="w-16 px-2 py-1 text-xs border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                        placeholder="0–100"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))
          }
        </div>
      )}

      {tab === 'Leaderboard' && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-highlight">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary">Rank</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary">Participant</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-text-secondary">Votes</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-text-secondary">Score</th>
              </tr>
            </thead>
            <tbody>
              {sortedSubs.map((sub, i) => (
                <tr key={sub.id} className="border-t border-border">
                  <td className="px-4 py-3 text-text-muted">#{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar src={sub.users?.avatar_url} name={sub.users?.full_name} size="sm" />
                      <span className="text-text-primary">{sub.users?.full_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-text-secondary">{sub.votes?.[0]?.count || 0}</td>
                  <td className="px-4 py-3 text-right text-text-secondary">{sub.instructor_score ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
