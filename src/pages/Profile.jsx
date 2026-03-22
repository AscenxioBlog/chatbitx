import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Github, ExternalLink, Edit } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Avatar } from '../components/ui/Avatar'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import Input from '../components/ui/Input'
import { PostCard } from '../components/feed/PostCard'

const TABS = ['Posts', 'Submissions']

export default function Profile() {
  const { id } = useParams()
  const { profile: myProfile } = useAuth()
  const [profileData, setProfileData] = useState(null)
  const [posts, setPosts] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [tab, setTab] = useState('Posts')
  const [editOpen, setEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  const targetId = id || myProfile?.id
  const isOwn = !id || id === myProfile?.id

  useEffect(() => {
    if (!targetId) return
    async function load() {
      const [profileRes, postsRes, subsRes] = await Promise.all([
        supabase.from('users').select('*').eq('id', targetId).single(),
        supabase.from('posts').select('*, users(id, full_name, role, avatar_url)').eq('user_id', targetId).order('created_at', { ascending: false }),
        supabase.from('submissions').select('*, competitions(title)').eq('user_id', targetId).order('created_at', { ascending: false }),
      ])
      setProfileData(profileRes.data)
      setPosts(postsRes.data || [])
      setSubmissions(subsRes.data || [])
    }
    load()
  }, [targetId])

  function openEdit() {
    reset({ full_name: profileData?.full_name, bio: profileData?.bio, avatar_url: profileData?.avatar_url, github_url: profileData?.github_url })
    setEditOpen(true)
  }

  async function onSave(data) {
    setSaving(true)
    const { error } = await supabase.from('users').update(data).eq('id', myProfile.id)
    setSaving(false)
    if (error) { toast.error('Failed to save'); return }
    setProfileData(prev => ({ ...prev, ...data }))
    toast.success('Profile updated!')
    setEditOpen(false)
  }

  if (!profileData) return <p className="text-sm text-text-muted">Loading...</p>

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="h-24 bg-highlight" />
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-8 mb-4">
            <Avatar src={profileData.avatar_url} name={profileData.full_name} size="xl" className="-mt-2 border-4 border-card" />
            {isOwn && <Button variant="outline" size="sm" onClick={openEdit}><Edit size={14} /> Edit Profile</Button>}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-medium text-text-primary">{profileData.full_name}</h1>
            <Badge label={profileData.role} variant={profileData.role} />
          </div>
          {profileData.bio && <p className="text-sm text-text-secondary mt-2">{profileData.bio}</p>}
          {profileData.github_url && (
            <a href={profileData.github_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-2">
              <Github size={14} /> {profileData.github_url.replace('https://github.com/', '@')}
            </a>
          )}
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

      {tab === 'Posts' && (
        <div className="flex flex-col gap-4">
          {posts.length === 0
            ? <p className="text-sm text-text-muted text-center py-8">No posts yet.</p>
            : posts.map(p => <PostCard key={p.id} post={p} />)
          }
        </div>
      )}

      {tab === 'Submissions' && (
        <div className="flex flex-col gap-4">
          {submissions.length === 0
            ? <p className="text-sm text-text-muted text-center py-8">No submissions yet.</p>
            : submissions.map(s => (
              <div key={s.id} className="bg-card border border-border rounded-xl p-6 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{s.competitions?.title}</p>
                    <p className="text-sm text-text-secondary mt-1">{s.description}</p>
                  </div>
                  {s.instructor_score != null && (
                    <span className="text-xs bg-highlight text-primary px-2 py-1 rounded-full font-medium shrink-0">{s.instructor_score}/100</span>
                  )}
                </div>
                <div className="flex gap-3">
                  {s.github_url && (
                    <a href={s.github_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-primary hover:underline">
                      <Github size={12} /> GitHub
                    </a>
                  )}
                  {s.demo_url && (
                    <a href={s.demo_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-primary hover:underline">
                      <ExternalLink size={12} /> Demo
                    </a>
                  )}
                </div>
              </div>
            ))
          }
        </div>
      )}

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile" size="md">
        <form onSubmit={handleSubmit(onSave)} className="flex flex-col gap-4">
          <Input label="Full Name" {...register('full_name', { required: true })} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-primary">Bio</label>
            <textarea {...register('bio')} rows={3} placeholder="Tell the community about yourself..."
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none" />
          </div>
          <Input label="Avatar URL" placeholder="https://..." {...register('avatar_url')} />
          <Input label="GitHub URL" placeholder="https://github.com/username" {...register('github_url')} />
          <Button type="submit" loading={saving} className="w-full">Save Changes</Button>
        </form>
      </Modal>
    </div>
  )
}
