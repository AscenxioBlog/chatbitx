import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchProfile(userId) {
    const { data } = await supabase.from('users').select('*').eq('auth_id', userId).single()
    setProfile(data)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signUp({ email, password, full_name, role }) {
    const safeRole = role || 'student'
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name, role: safeRole } },
    })
    if (error) throw error
    // Fallback: manually insert profile if trigger hasn't fired
    if (data.user) {
      const { data: existing } = await supabase.from('users').select('id').eq('auth_id', data.user.id).single()
      if (!existing) {
        await supabase.from('users').insert({ auth_id: data.user.id, full_name, role: safeRole })
      }
    }
  }

  async function signIn({ email, password }) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
