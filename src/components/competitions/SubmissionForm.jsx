import { useForm } from 'react-hook-form'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { Modal } from '../ui/Modal'
import Input from '../ui/Input'
import { Button } from '../ui/Button'

export function SubmissionForm({ competition, open, onClose, onSubmitted }) {
  const { profile } = useAuth()
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)

  async function onSubmit(data) {
    setLoading(true)
    const { error } = await supabase.from('submissions').insert({
      competition_id: competition.id,
      user_id: profile.id,
      github_url: data.github_url,
      demo_url: data.demo_url || null,
      description: data.description,
    })
    setLoading(false)
    if (error) { toast.error('Submission failed'); return }
    toast.success('Project submitted!')
    reset()
    onSubmitted?.()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Submit Project" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="GitHub Repository URL" placeholder="https://github.com/username/repo"
          error={errors.github_url?.message}
          {...register('github_url', { required: 'GitHub URL is required', pattern: { value: /^https?:\/\/.+/, message: 'Enter a valid URL' } })} />
        <Input label="Live Demo URL (optional)" placeholder="https://your-demo.vercel.app"
          {...register('demo_url')} />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-text-primary">Project Description</label>
          <textarea
            {...register('description', { required: 'Description is required' })}
            rows={3}
            placeholder="Describe what you built and the technologies used..."
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none"
          />
          {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
        </div>
        <Button type="submit" loading={loading} className="w-full">Submit Project</Button>
      </form>
    </Modal>
  )
}
