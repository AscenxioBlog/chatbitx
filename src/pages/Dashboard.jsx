import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Trophy, FileCode, ThumbsUp, Clock } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { PostCard } from '../components/feed/PostCard'
import { countdown, formatDate } from '../utils/formatDate'

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-highlight flex items-center justify-center text-primary">
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-medium text-text-primary">{value ?? '—'}</p>
        <p className="text-xs text-text-secondary mt-0.5">{label}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { profile } = useAuth()
  const [stats, setStats] = useState({})
  const [posts, setPosts] = useState([])
  const [competitions, setCompetitions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    async function load() {
      const [groupsRes, compsRes, subsRes, votesRes, postsRes, activeCompsRes] = await Promise.all([
        supabase.from('group_members').select('id', { count: 'exact' }).eq('user_id', profile.id),
        supabase.from('competition_registrations').select('id', { count: 'exact' }).eq('user_id', profile.id),
        supabase.from('submissions').select('id', { count: 'exact' }).eq('user_id', profile.id),
        supabase.from('votes').select('id', { count: 'exact' }).eq('voter_id', profile.id),
        supabase.from('posts').select('*, users(id, full_name, role, avatar_url)').is('group_id', null).order('created_at', { ascending: false }).limit(5),
        supabase.from('competitions').select('*').gte('deadline', new Date().toISOString()).order('deadline', { ascending: true }).limit(3),
      ])
      setStats({
        groups: groupsRes.count,
        competitions: compsRes.count,
        submissions: subsRes.count,
        votes: votesRes.count,
      })
      setPosts(postsRes.data || [])
      setCompetitions(activeCompsRes.data || [])
      setLoading(false)
    }
    load()
  }, [profile])

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-medium text-text-primary">Welcome back, {profile?.full_name?.split(' ')[0]} 👋</h1>
        <p className="text-sm text-text-secondary mt-1">Here's what's happening at BitxBase today.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Groups Joined" value={stats.groups} />
        <StatCard icon={Trophy} label="Competitions" value={stats.competitions} />
        <StatCard icon={FileCode} label="Submissions" value={stats.submissions} />
        <StatCard icon={ThumbsUp} label="Votes Cast" value={stats.votes} />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 flex flex-col gap-4">
          <h2 className="text-sm font-medium text-text-primary">Recent Posts</h2>
          {loading
            ? <p className="text-sm text-text-muted">Loading...</p>
            : posts.length === 0
              ? <p className="text-sm text-text-muted">No posts yet.</p>
              : posts.map(p => <PostCard key={p.id} post={p} />)
          }
          <Link to="/feed" className="text-sm text-primary hover:underline">View all posts →</Link>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-medium text-text-primary">Active Competitions</h2>
          {competitions.length === 0
            ? <p className="text-sm text-text-muted">No active competitions.</p>
            : competitions.map(c => (
              <Link key={c.id} to={`/competitions/${c.id}`} className="bg-card border border-border rounded-xl p-4 hover:border-primary/40 transition-colors">
                <p className="text-sm font-medium text-text-primary">{c.title}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-text-muted">
                  <Clock size={12} />
                  <span>{countdown(c.deadline)}</span>
                </div>
                {c.prize && <p className="text-xs text-primary mt-1 font-medium">{c.prize}</p>}
              </Link>
            ))
          }
          <Link to="/competitions" className="text-sm text-primary hover:underline">View all →</Link>
        </div>
      </div>
    </div>
  )
}
