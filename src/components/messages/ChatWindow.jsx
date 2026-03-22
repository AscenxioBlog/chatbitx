import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Paperclip, Send, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useMessages } from '../../hooks/useMessages'
import { useAuth } from '../../context/AuthContext'
import { uploadImage } from '../../utils/uploadImage'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'

export default function ChatWindow({ otherUser, onBack }) {
  const { profile } = useAuth()
  const { messages, loading, sendMessage } = useMessages(otherUser?.id)
  const [text, setText] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [activeImage, setActiveImage] = useState(null)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)
  const fileRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleImagePick(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function removeImage() {
    setImageFile(null)
    setImagePreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleSend(e) {
    e.preventDefault()
    if (!text.trim() && !imageFile) return
    setSending(true)

    let imageUrl = null
    if (imageFile) {
      const { url, error } = await uploadImage(imageFile, 'messages')
      if (error) { toast.error('Image upload failed'); setSending(false); return }
      imageUrl = url
    }

    const { error } = await sendMessage({ content: text, imageUrl })
    if (error) toast.error('Failed to send message')
    else { setText(''); removeImage() }
    setSending(false)
  }

  if (!otherUser) return (
    <div className="flex-1 flex items-center justify-center text-text-muted text-sm bg-card">
      Select a conversation to start chatting
    </div>
  )

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-gradient-to-r from-card via-card to-highlight">
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden w-9 h-9 rounded-full border border-border flex items-center justify-center text-text-muted hover:text-text-primary hover:border-text-primary transition"
            aria-label="Back to conversations"
          >
            <ArrowLeft size={16} />
          </button>
        )}
        <Avatar src={otherUser.avatar_url} name={otherUser.full_name} />
        <div className="min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">{otherUser.full_name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge label={otherUser.role} variant={otherUser.role} />
            <span className="text-[11px] text-text-muted">Active now</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-3 bg-[radial-gradient(circle_at_top,_#F1F0FB,_transparent_55%)]">
        {loading
          ? <p className="text-center text-sm text-text-muted">Loading...</p>
          : messages.length === 0
            ? <p className="text-center text-sm text-text-muted">No messages yet. Say hello!</p>
            : messages.map(msg => {
              const isMine = msg.sender_id === profile?.id
              return (
                <div key={msg.id} className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : ''}`}>
                  <Avatar
                    src={isMine ? profile?.avatar_url : otherUser.avatar_url}
                    name={isMine ? profile?.full_name : otherUser.full_name}
                    size="sm"
                  />
                  <div className={`max-w-[75%] flex flex-col gap-1 ${isMine ? 'items-end' : 'items-start'}`}>
                    {msg.image_url && (
                      <img
                        src={msg.image_url}
                        alt="attachment"
                        className="rounded-2xl w-full max-w-xs max-h-64 object-cover border border-border shadow-sm cursor-zoom-in"
                        onClick={() => setActiveImage(msg.image_url)}
                      />
                    )}
                    {msg.content && (
                      <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm break-words ${isMine ? 'bg-primary text-white rounded-br-sm' : 'bg-white text-text-primary border border-border rounded-bl-sm'}`}>
                        {msg.content}
                      </div>
                    )}
                    <span className="text-[10px] text-text-muted">
                      {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )
            })
        }
        <div ref={bottomRef} />
      </div>

      {/* Image preview */}
      {imagePreview && (
        <div className="px-4 pb-2 relative w-fit">
          <img src={imagePreview} alt="preview" className="h-20 rounded-xl border border-border object-cover" />
          <button onClick={removeImage}
            className="absolute -top-1 -right-1 bg-text-primary text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-500 transition">
            <X size={10} />
          </button>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSend} className="border-t border-border p-3 flex items-center gap-2 bg-card">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
        <button type="button" onClick={() => fileRef.current?.click()}
          className="text-text-muted hover:text-primary transition p-2 rounded-full border border-border bg-surface">
          <Paperclip size={18} />
        </button>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-surface border border-border rounded-full px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
        />
        <button type="submit" disabled={sending || (!text.trim() && !imageFile)}
          className="bg-primary text-white px-4 py-2.5 rounded-full hover:bg-primary-hover transition disabled:opacity-50">
          <Send size={16} />
        </button>
      </form>

      {/* Image lightbox */}
      {activeImage && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setActiveImage(null)}
        >
          <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setActiveImage(null)}
              className="absolute -top-3 -right-3 bg-white text-text-primary rounded-full w-8 h-8 flex items-center justify-center border border-border hover:bg-surface transition"
              aria-label="Close image"
            >
              <X size={14} />
            </button>
            <img
              src={activeImage}
              alt="Attachment preview"
              className="w-full max-h-[85vh] object-contain rounded-2xl border border-border bg-card"
            />
          </div>
        </div>
      )}
    </div>
  )
}
