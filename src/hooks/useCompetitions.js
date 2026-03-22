import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useCompetitions(filters = {}) {
  const [competitions, setCompetitions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      let query = supabase
        .from('competitions')
        .select('*, competition_registrations(count)')
        .order('created_at', { ascending: false })

      if (filters.category) query = query.eq('category', filters.category)
      if (filters.difficulty) query = query.eq('difficulty', filters.difficulty)
      if (filters.status === 'open') query = query.gte('deadline', new Date().toISOString())
      if (filters.status === 'closed') query = query.lt('deadline', new Date().toISOString())

      const { data, error: err } = await query
      if (err) setError(err.message)
      else setCompetitions(data)
      setLoading(false)
    }
    fetch()
  }, [filters.category, filters.difficulty, filters.status])

  return { competitions, loading, error }
}
