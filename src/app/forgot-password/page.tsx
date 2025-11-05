'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error('Failed to send email')
      setSent(true)
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-6 glass p-8 rounded-2xl">
        <h1 className="text-2xl font-bold">Forgot Password</h1>
        {sent ? (
          <p className="text-sm text-gray-300">If an account exists, you'll receive an email with a reset link.</p>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            {error && <div className="text-sm text-red-300">{error}</div>}
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Button type="submit" loading={loading} className="w-full">Send reset link</Button>
          </form>
        )}
      </div>
    </div>
  )
}


