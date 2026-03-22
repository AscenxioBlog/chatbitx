import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useMessages(otherUserId) {
  const { profile } = useAuth()
  const [messages, setMessages] = useState([])
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchConversations = useCallback(async () => {
    if (!profile) return
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id, content, image_url, is_read, sent_at,
        sender:users!messages_sender_id_fkey ( id, full_name, avatar_url, role ),
        receiver:users!messages_receiver_id_fkey ( id, full_name, avatar_url, role )
      `)
      .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
      .order('sent_at', { ascending: false })

    if (error) {
      console.error('fetchConversations error:', error)
      return
    }

    const seen = new Map()
    data?.forEach(msg => {
      const partner = msg.sender.id === profile.id ? msg.receiver : msg.sender
      if (!seen.has(partner.id)) seen.set(partner.id, { partner, lastMessage: msg })
    })
    setConversations(Array.from(seen.values()))
  }, [profile])

  const fetchMessages = useCallback(async () => {
    if (!profile || !otherUserId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id, content, image_url, is_read, sent_at,
        sender:users!messages_sender_id_fkey ( id, full_name, avatar_url )
      `)
      .or(
        `and(sender_id.eq.${profile.id},receiver_id.eq.${otherUserId}),` +
        `and(sender_id.eq.${otherUserId},receiver_id.eq.${profile.id})`
      )
      .order('sent_at', { ascending: true })

    if (error) {
      console.error('fetchMessages error:', error)
      setLoading(false)
      return
    }

    setMessages(data || [])
    setLoading(false)

    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('sender_id', otherUserId)
      .eq('receiver_id', profile.id)
      .eq('is_read', false)
  }, [profile, otherUserId])

  const sendMessage = async ({ content, imageUrl = null }) => {
    if (!content?.trim() && !imageUrl) return
    const { error } = await supabase.from('messages').insert({
      sender_id: profile.id,
      receiver_id: otherUserId,
      content: content?.trim() || null,
      image_url: imageUrl,
    })
    return { error }
  }

  useEffect(() => {
    if (!profile || !otherUserId) return
    fetchMessages()

    const channel = supabase
      .channel(`dm-${profile.id}-${otherUserId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        const msg = payload.new
        const isRelevant =
          (msg.sender_id === profile.id && msg.receiver_id === otherUserId) ||
          (msg.sender_id === otherUserId && msg.receiver_id === profile.id)
        if (isRelevant) setMessages(prev => [...prev, msg])
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [profile, otherUserId, fetchMessages])

  useEffect(() => { fetchConversations() }, [fetchConversations])

  return { messages, conversations, loading, sendMessage, fetchConversations }
}
