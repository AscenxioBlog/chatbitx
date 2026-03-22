import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import Input from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  async function onSubmit(data) {
    setLoading(true)
    try {
      await signUp(data)
      toast.success('Account created! Check your email to confirm.')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-primary">ChatBitx</h1>
          <p className="text-sm text-text-secondary mt-1">Create your account</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="Full Name"
              placeholder="Ada Okonkwo"
              error={errors.full_name?.message}
              {...register('full_name', { required: 'Full name is required' })}
            />
            <Input
              label="Email"
              type="email"
              placeholder="ada@example.com"
              error={errors.email?.message}
              {...register('email', { required: 'Email is required' })}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Min. 8 characters"
              error={errors.password?.message}
              {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min. 8 characters' } })}
            />
            <input type="hidden" value="student" {...register('role')} />
            <Button type="submit" loading={loading} className="w-full mt-2">Create Account</Button>
          </form>
        </div>
        <p className="text-center text-sm text-text-secondary mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
