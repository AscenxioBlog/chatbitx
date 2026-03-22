import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Avatar } from '../components/ui/Avatar'

const TABS = ['All Time', 'This Month']

export default function Leaderboard() {
  const [tab, setTab] = useState('All Time')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      let query = supabase
        .from('users')
        .select(`
          id, full_name, avatar_url, role,
          competition_registrations(count),
          submissions(instructor_score, votes(count))
        `)

      const { data } = await query
      if (!data) { setLoading(false); return }

      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const processed = data.map(u => {
        const totalVotes = u.submissions?.reduce((acc, s) => acc + (s.votes?.[0]?.count || 0), 0) || 0
        const totalScore = u.submissions?.reduce((acc, s) => acc + (s.instructor_score || 0), 0) || 0
        return {
          ...u,
          totalCompetitions: u.competition_registrations?.[0]?.count || 0,
          totalVotes,
          totalScore,
        }
      }).sort((a, b) => b.totalVotes - a.totalVotes || b.totalScore - a.totalScore)

      setRows(processed)
      setLoading(false)
    }
    load()
  }, [tab])

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <h1 className="text-xl font-medium text-text-primary">Leaderboard</h1>

      <div className="flex gap-1 border-b border-border">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm transition-colors border-b-2 -mb-px ${tab === t ? 'border-primary text-primary font-medium' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>
            {t}
          </button>
        ))}
      </div>

      {loading
        ? <p className="text-sm text-text-muted">Loading...</p>
        : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-highlight">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary">Rank</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary">Member</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-text-secondary hidden sm:table-cell">Competitions</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-text-secondary">Votes</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-text-secondary hidden md:table-cell">Score</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.id}
                    className={`border-t border-border ${i < 3 ? 'border-l-2 border-l-primary' : ''}`}>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-400' : 'text-text-muted'}`}>
                        #{i + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar src={row.avatar_url} name={row.full_name} size="sm" />
                        <span className="text-text-primary font-medium">{row.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-text-secondary hidden sm:table-cell">{row.totalCompetitions}</td>
                    <td className="px-4 py-3 text-right text-text-secondary">{row.totalVotes}</td>
                    <td className="px-4 py-3 text-right text-text-secondary hidden md:table-cell">{row.totalScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
    </div>
  )
}
