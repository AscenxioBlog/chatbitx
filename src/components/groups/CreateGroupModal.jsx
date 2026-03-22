import { useForm } from 'react-hook-form'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Copy } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { Modal } from '../ui/Modal'
import Input from '../ui/Input'
import { Button } from '../ui/Button'
import { generatePasscode } from '../../utils/passcode'

const GROUP_TYPES = ['class', 'project', 'study', 'general']

export function CreateGroupModal({ open, onClose, onCreated }) {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [passcode] = useState(generatePasscode)
  const { register, handleSubmit, formState: { errors } } = useForm()

  async function onSubmit(data) {
    setLoading(true)
    const { error } = await supabase.from('groups').insert({
      name: data.name,
      description: data.description,
      type: data.type,
      max_members: data.max_members ? parseInt(data.max_members) : null,
      passcode,
      created_by: profile.id,
    })
    setLoading(false)
    if (error) { toast.error('Failed to create group'); return }
    toast.success('Group created!')
    onCreated?.()
    onClose()
  }

  function copyPasscode() {
    navigator.clipboard.writeText(passcode)
    toast.success('Passcode copied!')
  }

  return (
    <Modal open={open} onClose={onClose} title="Create Group" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Group Name" placeholder="e.g. React Fundamentals" error={errors.name?.message}
          {...register('name', { required: 'Name is required' })} />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-text-primary">Description</label>
          <textarea
            {...register('description')}
            rows={2}
            placeholder="What is this group about?"
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-text-primary">Type</label>
          <select {...register('type', { required: true })} className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition">
            {GROUP_TYPES.map(t => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>
        <Input label="Max Members (optional)" type="number" placeholder="e.g. 30" {...register('max_members')} />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-text-primary">Passcode</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-highlight font-mono text-text-primary tracking-widest">{passcode}</div>
            <Button type="button" variant="outline" size="sm" onClick={copyPasscode}><Copy size={14} /></Button>
          </div>
          <p className="text-xs text-text-muted">Share this code with students to let them join.</p>
        </div>
        <Button type="submit" loading={loading} className="w-full">Create Group</Button>
      </form>
    </Modal>
  )
}
