import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { timeAgo } from '../../utils/formatDate'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

export function PostCard({ post, onLike }) {
  const { profile } = useAuth()
  const [liked, setLiked] = useState(post.liked_by_me || false)
  const [count, setCount] = useState(post.likes_count || 0)
  const [loading, setLoading] = useState(false)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [loadingComments, setLoadingComments] = useState(true)
  const [showComments, setShowComments] = useState(false)

  async function handleLike() {
    if (loading || !profile) return
    setLoading(true)
    if (liked) {
      await supabase.from('post_likes').delete().eq('post_id', post.id).eq('user_id', profile.id)
      setLiked(false); setCount(c => c - 1)
    } else {
      await supabase.from('post_likes').insert({ post_id: post.id, user_id: profile.id })
      setLiked(true); setCount(c => c + 1)
    }
    setLoading(false)
    onLike?.()
  }

  useEffect(() => {
    if (!showComments) return
    let ignore = false
    async function fetchComments() {
      setLoadingComments(true)
      const { data, error } = await supabase
        .from('post_comments')
        .select('id, content, created_at, users(id, full_name, avatar_url)')
        .eq('post_id', post.id)
        .order('created_at', { ascending: true })

      if (!ignore) {
        if (error) {
          console.error('fetchComments error:', error)
          setComments([])
        } else {
          setComments(data || [])
        }
        setLoadingComments(false)
      }
    }

    fetchComments()
    return () => { ignore = true }
  }, [post.id, showComments])

  async function handleCommentSubmit(e) {
    e.preventDefault()
    if (!commentText.trim() || !profile) return
    const content = commentText.trim()
    setCommentText('')
    const { data, error } = await supabase
      .from('post_comments')
      .insert({ post_id: post.id, user_id: profile.id, content })
      .select('id, content, created_at, users(id, full_name, avatar_url)')
      .single()

    if (error) {
      console.error('comment insert error:', error)
      setCommentText(content)
      return
    }
    setComments(prev => [...prev, data])
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-start gap-3">
        <Avatar src={post.users?.avatar_url} name={post.users?.full_name} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-text-primary">{post.users?.full_name}</span>
            <Badge label={post.users?.role} variant={post.users?.role} />
            {post.type !== 'text' && <Badge label={post.type} variant={post.type} />}
            <span className="text-xs text-text-muted ml-auto">{timeAgo(post.created_at)}</span>
          </div>
          <p className="mt-2 text-sm text-text-primary whitespace-pre-wrap">{post.content}</p>
          {post.image_url && (
            <img src={post.image_url} alt="post attachment"
              className="mt-3 rounded-xl w-full max-h-80 object-cover border border-border" />
          )}
          <div className="mt-3 flex items-center gap-2">
            <button onClick={handleLike} className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg transition-colors ${liked ? 'text-red-500 bg-red-50' : 'text-text-muted hover:bg-highlight'}`}>
              <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
              {count > 0 && count}
            </button>
            <button
              onClick={() => setShowComments(v => !v)}
              className="text-xs px-2 py-1 rounded-lg text-text-muted hover:bg-highlight transition-colors"
            >
              {showComments ? 'Hide comments' : 'View comments'}
            </button>
          </div>

          {showComments && (
            <div className="mt-4 border-t border-border pt-3">
              <p className="text-xs font-medium text-text-muted">Comments</p>
              <div className="mt-3 flex flex-col gap-3">
                {loadingComments && (
                  <p className="text-xs text-text-muted">Loading comments...</p>
                )}
                {!loadingComments && comments.length === 0 && (
                  <p className="text-xs text-text-muted">Be the first to comment.</p>
                )}
                {comments.map(c => (
                  <div key={c.id} className="flex items-start gap-2">
                    <Avatar src={c.users?.avatar_url} name={c.users?.full_name} size="sm" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-text-primary">{c.users?.full_name}</span>
                        <span className="text-[10px] text-text-muted">{timeAgo(c.created_at)}</span>
                      </div>
                      <p className="text-xs text-text-primary break-words">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleCommentSubmit} className="mt-3 flex items-center gap-2">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 bg-surface border border-border rounded-full px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="text-xs px-3 py-2 rounded-full bg-primary text-white hover:bg-primary-hover transition disabled:opacity-50"
                >
                  Post
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
