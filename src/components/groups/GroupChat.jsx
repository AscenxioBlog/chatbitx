import { useState, useEffect, useRef } from 'react'
import { Send } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { Avatar } from '../ui/Avatar'
import { timeAgo } from '../../utils/formatDate'

export function GroupChat({ groupId }) {
  const { profile } = useAuth()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    async function fetchMessages() {
      const { data } = await supabase
        .from('group_messages')
        .select('*, users(id, full_name, avatar_url)')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true })
        .limit(100)
      setMessages(data || [])
    }
    fetchMessages()

    const channel = supabase
      .channel(`group-chat-${groupId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'group_messages', filter: `group_id=eq.${groupId}` },
        async (payload) => {
          const { data } = await supabase.from('group_messages').select('*, users(id, full_name, avatar_url)').eq('id', payload.new.id).single()
          if (data) setMessages(prev => [...prev, data])
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [groupId])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function send(e) {
    e.preventDefault()
    if (!text.trim() || sending) return
    setSending(true)
    await supabase.from('group_messages').insert({ group_id: groupId, user_id: profile.id, content: text.trim() })
    setText('')
    setSending(false)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0">
        {messages.map(msg => {
          const isMe = msg.user_id === profile?.id
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
              {!isMe && <Avatar src={msg.users?.avatar_url} name={msg.users?.full_name} size="sm" />}
              <div className={`max-w-[70%] px-3 py-2 rounded-xl text-sm ${isMe ? 'bg-primary text-white rounded-br-sm' : 'bg-highlight text-text-primary rounded-bl-sm'}`}>
                {!isMe && <p className="text-xs font-medium mb-1 opacity-70">{msg.users?.full_name}</p>}
                <p>{msg.content}</p>
                <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-text-muted'}`}>{timeAgo(msg.created_at)}</p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="flex gap-2 p-3 border-t border-border">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
        />
        <button type="submit" disabled={!text.trim() || sending} className="p-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50">
          <Send size={16} />
        </button>
      </form>
    </div>
  )
}
