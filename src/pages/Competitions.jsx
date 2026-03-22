import { useState } from 'react'
import { useCompetitions } from '../hooks/useCompetitions'
import { useAuth } from '../hooks/useAuth'
import { CompetitionCard } from '../components/competitions/CompetitionCard'
import { SubmissionForm } from '../components/competitions/SubmissionForm'
import { PayButton } from '../components/competitions/PayButton'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { supabase } from '../lib/supabase'
import { useEffect } from 'react'
import toast from 'react-hot-toast'

const CATEGORIES = ['All', 'Frontend', 'Backend', 'Fullstack', 'Mobile', 'AI/ML', 'DevOps']
const DIFFICULTIES = ['All', 'easy', 'medium', 'hard']

export default function Competitions() {
  const { profile, user } = useAuth()
  const [filters, setFilters] = useState({})
  const { competitions, loading } = useCompetitions(filters)
  const [registeredIds, setRegisteredIds] = useState(new Set())
  const [registerTarget, setRegisterTarget] = useState(null)
  const [submitTarget, setSubmitTarget] = useState(null)

  useEffect(() => {
    if (!profile) return
    supabase.from('competition_registrations').select('competition_id').eq('user_id', profile.id)
      .then(({ data }) => setRegisteredIds(new Set(data?.map(r => r.competition_id) || [])))
  }, [profile])

  async function handleFreeRegister(competition) {
    const { error } = await supabase.from('competition_registrations').insert({
      competition_id: competition.id,
      user_id: profile.id,
      payment_status: 'free',
    })
    if (error) { toast.error('Registration failed'); return }
    toast.success('Registered!')
    setRegisteredIds(prev => new Set([...prev, competition.id]))
    setRegisterTarget(null)
  }

  function setFilter(key, value) {
    setFilters(prev => ({ ...prev, [key]: value === 'All' ? undefined : value }))
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      <h1 className="text-xl font-medium text-text-primary">Competitions</h1>

      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setFilter('category', c)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${(filters.category || 'All') === c ? 'bg-primary text-white border-primary' : 'border-border text-text-muted hover:border-primary hover:text-primary'}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-1 flex-wrap">
          {DIFFICULTIES.map(d => (
            <button key={d} onClick={() => setFilter('difficulty', d)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors capitalize ${(filters.difficulty || 'All') === d ? 'bg-primary text-white border-primary' : 'border-border text-text-muted hover:border-primary hover:text-primary'}`}>
              {d}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {['All', 'open', 'closed'].map(s => (
            <button key={s} onClick={() => setFilter('status', s)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors capitalize ${(filters.status || 'All') === s ? 'bg-primary text-white border-primary' : 'border-border text-text-muted hover:border-primary hover:text-primary'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading
        ? <p className="text-sm text-text-muted">Loading competitions...</p>
        : competitions.length === 0
          ? <p className="text-sm text-text-muted text-center py-8">No competitions found.</p>
          : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {competitions.map(c => (
                <CompetitionCard
                  key={c.id}
                  competition={c}
                  isRegistered={registeredIds.has(c.id)}
                  onRegister={setRegisterTarget}
                  onSubmit={setSubmitTarget}
                />
              ))}
            </div>
          )
      }

      {registerTarget && (
        <Modal open={!!registerTarget} onClose={() => setRegisterTarget(null)} title={`Register: ${registerTarget.title}`} size="sm">
          <div className="flex flex-col gap-4">
            <p className="text-sm text-text-secondary">
              {registerTarget.entry_fee > 0
                ? `Entry fee: ₦${registerTarget.entry_fee?.toLocaleString()}`
                : 'This competition is free to enter.'}
            </p>
            {registerTarget.entry_fee > 0
              ? <PayButton competition={registerTarget} userId={profile.id} userEmail={user.email}
                  onSuccess={() => { setRegisteredIds(prev => new Set([...prev, registerTarget.id])); setRegisterTarget(null) }} />
              : <Button onClick={() => handleFreeRegister(registerTarget)} className="w-full">Confirm Registration</Button>
            }
          </div>
        </Modal>
      )}

      {submitTarget && (
        <SubmissionForm
          competition={submitTarget}
          open={!!submitTarget}
          onClose={() => setSubmitTarget(null)}
          onSubmitted={() => setSubmitTarget(null)}
        />
      )}
    </div>
  )
}
