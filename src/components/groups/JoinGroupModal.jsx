import { useForm } from 'react-hook-form'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { Modal } from '../ui/Modal'
import Input from '../ui/Input'
import { Button } from '../ui/Button'

export function JoinGroupModal({ group, open, onClose, onJoined }) {
  const { profile } = useAuth()
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)

  async function onSubmit({ passcode }) {
    if (passcode.toUpperCase() !== group.passcode) {
      toast.error('Incorrect passcode')
      return
    }
    setLoading(true)
    const { error } = await supabase.from('group_members').insert({ group_id: group.id, user_id: profile.id })
    setLoading(false)
    if (error) { toast.error('Could not join group'); return }
    toast.success(`Joined ${group.name}!`)
    reset()
    onJoined?.()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={`Join "${group?.name}"`} size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <p className="text-sm text-text-secondary">Enter the 6-character passcode to join this group.</p>
        <Input
          label="Passcode"
          placeholder="e.g. AB3X7K"
          error={errors.passcode?.message}
          {...register('passcode', { required: 'Passcode is required', minLength: { value: 6, message: 'Must be 6 characters' } })}
        />
        <Button type="submit" loading={loading} className="w-full">Join Group</Button>
      </form>
    </Modal>
  )
}
