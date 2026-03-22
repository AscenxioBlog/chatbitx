import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useGroups() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchGroups() {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('groups')
      .select('*, users(full_name), group_members(count)')
      .order('created_at', { ascending: false })
    if (err) setError(err.message)
    else setGroups(data)
    setLoading(false)
  }

  useEffect(() => { fetchGroups() }, [])

  return { groups, loading, error, refresh: fetchGroups }
}
