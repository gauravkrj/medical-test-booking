'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FlaskConical, ArrowRight } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])

  const validatePassword = (password: string): string[] => {
    const errors: string[] = []
    if (password.length < 8) {
      errors.push('At least 8 characters')
    }
    if (!/[a-z]/.test(password)) {
      errors.push('One lowercase letter')
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('One uppercase letter')
    }
    if (!/[0-9]/.test(password)) {
      errors.push('One number')
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('One special character')
    }
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setPasswordErrors([])

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    const pwdErrors = validatePassword(formData.password)
    if (pwdErrors.length > 0) {
      setPasswordErrors(pwdErrors)
      setError('Password does not meet requirements')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.details && Array.isArray(data.details)) {
          setPasswordErrors(data.details)
        }
        setError(data.error || 'Failed to create account')
        setLoading(false)
        return
      }

      // Redirect to login
      router.push('/login?registered=true')
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
            <span className="text-gradient">Create Account</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Sign up to book medical tests
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="glass rounded-2xl p-8">
            {error && (
              <div className="mb-6 glass rounded-xl p-4 border border-red-500/30 bg-red-500/10">
                <span className="text-red-300 text-sm">{error}</span>
              </div>
            )}
            
            <div className="space-y-5">
              <Input
                label="Full Name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              
              <Input
                label="Phone Number"
                type="tel"
                placeholder="+1 234 567 8900"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
              
              <div>
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter a strong password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value })
                    if (e.target.value) {
                      setPasswordErrors(validatePassword(e.target.value))
                    } else {
                      setPasswordErrors([])
                    }
                  }}
                  required
                />
                {passwordErrors.length > 0 && (
                  <div className="mt-2 text-xs text-gray-400">
                    <p className="mb-1">Password must contain:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {passwordErrors.map((err, idx) => (
                        <li key={idx} className="text-red-300">{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <div className="mt-6">
              <Button type="submit" loading={loading} className="w-full">
                {loading ? 'Creating account...' : 'Create Account'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

