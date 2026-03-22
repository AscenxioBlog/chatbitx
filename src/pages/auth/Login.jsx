import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import Input from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  async function onSubmit(data) {
    setLoading(true)
    try {
      await signIn(data)
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
          <p className="text-sm text-text-secondary mt-1">Sign in to your account</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
              placeholder="Your password"
              error={errors.password?.message}
              {...register('password', { required: 'Password is required' })}
            />
            <Button type="submit" loading={loading} className="w-full mt-2">Sign In</Button>
          </form>
        </div>
        <p className="text-center text-sm text-text-secondary mt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:underline font-medium">Create one</Link>
        </p>
      </div>
    </div>
  )
}
