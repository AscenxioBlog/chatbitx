import { useRef, useState } from 'react'
import { ImagePlus, X, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { uploadImage } from '../../utils/uploadImage'

const POST_TYPES = ['text', 'resource', 'announcement']

export function CreatePost({ groupId = null, onCreated }) {
  const { profile } = useAuth()
  const [content, setContent] = useState('')
  const [type, setType] = useState('text')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef(null)

  const canAnnounce = profile?.role === 'instructor' || profile?.role === 'admin'
  const availableTypes = canAnnounce ? POST_TYPES : POST_TYPES.filter(t => t !== 'announcement')

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

  async function handleSubmit(e) {
    e.preventDefault()
    if (!content.trim() && !imageFile) return
    setLoading(true)

    let imageUrl = null
    if (imageFile) {
      const { url, error } = await uploadImage(imageFile, 'posts')
      if (error) { toast.error('Image upload failed'); setLoading(false); return }
      imageUrl = url
    }

    const { error } = await supabase.from('posts').insert({
      user_id: profile.id,
      group_id: groupId,
      content: content.trim() || null,
      image_url: imageUrl,
      type,
    })

    if (error) toast.error('Failed to post')
    else {
      toast.success('Posted!')
      setContent('')
      setType('text')
      removeImage()
      onCreated?.()
    }
    setLoading(false)
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="min-h-[180px] flex flex-col">
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Share something with the community..."
          rows={6}
          className="w-full bg-amber-500 flex-1 min-h-[120px] text-sm text-text-primary placeholder:text-text-muted  resize-none focus:outline-none"
        />

        <div className=" min-h-[72px]">
          {imagePreview && (
            <div className="relative w-fit">
              <img src={imagePreview} alt="preview" className="h-32 rounded-lg border border-border object-cover" />
              <button onClick={removeImage}
                className="absolute -top-2 -right-2 bg-text-primary text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-500 transition">
                <X size={10} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
          <button type="button" onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1 text-xs text-text-muted hover:text-primary transition px-2 py-1 rounded-lg hover:bg-highlight">
            <ImagePlus size={14} /> Photo
          </button>
          <div className="">
            {availableTypes.map(t => (
              <button key={t} type="button" onClick={() => setType(t)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors capitalize ${type === t ? 'bg-primary text-white border-primary' : 'border-border text-text-muted hover:border-primary hover:text-primary'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <button onClick={handleSubmit} disabled={loading || (!content.trim() && !imageFile)}
          className="flex items-center gap-1.5 bg-primary text-white text-xs font-medium px-4 py-1.5 rounded-lg hover:bg-primary-hover transition disabled:opacity-50">
          {loading ? 'Posting...' : <><Send size={13} /> Post</>}
        </button>
      </div>
    </div>
  )
}
