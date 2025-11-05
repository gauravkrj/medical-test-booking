'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FlaskConical, ArrowRight } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'EMAIL_NOT_FOUND':
        return 'Account with this email does not exist. Please sign up or check your email address.'
      case 'INVALID_PASSWORD':
        return 'Incorrect password. Please try again or use "Forgot password?" to reset.'
      case 'EMAIL_AND_PASSWORD_REQUIRED':
        return 'Please enter both email and password.'
      case 'CredentialsSignin':
        return 'Invalid email or password. Please try again.'
      default:
        return 'An error occurred. Please try again.'
    }
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        const friendlyError = getErrorMessage(result.error)
        setError(friendlyError)
        setLoading(false)
      } else {
        // Fetch session to get user role
        const sessionRes = await fetch('/api/auth/session')
        const session = await sessionRes.json()
        
        // Redirect based on user role
        const redirectUrl = session?.user?.role === 'ADMIN' ? '/admin/dashboard' : '/'
        router.push(redirectUrl)
        router.refresh()
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center">
              <FlaskConical className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-extrabold mb-3">
            <span className="text-gradient">Welcome Back</span>
          </h2>
          <p className="text-gray-400 text-lg">Sign in to your account</p>
          <p className="mt-4 text-sm text-gray-500">
            Don't have an account?{' '}
            <Link href="/signup" className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
              Sign up
            </Link>
          </p>
        </div>

        <div className="glass rounded-2xl p-6">
          {error && (
            <div className="mb-6 glass rounded-xl p-4 border border-red-500/30 bg-red-500/10">
              <span className="text-red-300 text-sm">{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleEmailLogin}>
            <Input label="Email Address" type="email" placeholder="you@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            <Input label="Password" type="password" placeholder="Enter your password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
            <div className="flex items-center justify-between text-sm">
              <Link href="/forgot-password" className="text-emerald-400 hover:text-emerald-300">Forgot password?</Link>
            </div>
            <Button type="submit" loading={loading} className="w-full">
              {loading ? 'Signing in...' : 'Sign In'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

