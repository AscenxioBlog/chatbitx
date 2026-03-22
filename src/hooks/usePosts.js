import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

export function usePosts(groupId = null) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const pageRef = useRef(0)
  const PAGE_SIZE = 10

  const fetchPosts = useCallback(async (reset = false) => {
    const page = reset ? 0 : pageRef.current
    setLoading(true)
    let query = supabase
      .from('posts')
      .select('*, users(id, full_name, role, avatar_url)')
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1)

    if (groupId) query = query.eq('group_id', groupId)
    else query = query.is('group_id', null)

    const { data, error: err } = await query
    if (err) { setError(err.message); setLoading(false); return }
    setPosts(prev => reset ? data : [...prev, ...data])
    setHasMore(data.length === PAGE_SIZE)
    pageRef.current = page + 1
    setLoading(false)
  }, [groupId])

  useEffect(() => { pageRef.current = 0; fetchPosts(true) }, [fetchPosts])

  return { posts, loading, error, hasMore, loadMore: () => fetchPosts(false), refresh: () => { pageRef.current = 0; fetchPosts(true) } }
}
