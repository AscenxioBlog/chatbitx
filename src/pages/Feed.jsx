import { useRef, useCallback } from 'react'
import { usePosts } from '../hooks/usePosts'
import { PostCard } from '../components/feed/PostCard'
import { CreatePost } from '../components/feed/CreatePost'

export default function Feed() {
  const { posts, loading, hasMore, loadMore, refresh } = usePosts()
  const observer = useRef(null)

  const lastPostRef = useCallback(node => {
    if (loading) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) loadMore()
    })
    if (node) observer.current.observe(node)
  }, [loading, hasMore, loadMore])

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">
      <h1 className="text-xl font-medium text-text-primary">Feed</h1>
      <CreatePost onCreated={refresh} />
      {posts.map((post, i) => (
        <div key={post.id} ref={i === posts.length - 1 ? lastPostRef : null}>
          <PostCard post={post} />
        </div>
      ))}
      {loading && <p className="text-sm text-text-muted text-center py-4">Loading...</p>}
      {!hasMore && posts.length > 0 && <p className="text-sm text-text-muted text-center py-4">You've reached the end.</p>}
      {!loading && posts.length === 0 && <p className="text-sm text-text-muted text-center py-8">No posts yet. Be the first to share something!</p>}
    </div>
  )
}
