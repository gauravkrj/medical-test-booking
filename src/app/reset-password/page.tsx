'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function ResetPasswordPage() {
  const params = useSearchParams()
  const router = useRouter()
  const token = params.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) return setError('Password must be at least 6 characters')
    if (password !== confirm) return setError('Passwords do not match')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setDone(true)
      setTimeout(() => router.push('/login'), 1500)
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="glass p-8 rounded-2xl">Invalid reset link</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-6 glass p-8 rounded-2xl">
        <h1 className="text-2xl font-bold">Set a new password</h1>
        {done ? (
          <p className="text-sm text-gray-300">Password updated. Redirecting to login…</p>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            {error && <div className="text-sm text-red-300">{error}</div>}
            <Input label="New Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Input label="Confirm Password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            <Button type="submit" loading={loading} className="w-full">Update password</Button>
          </form>
        )}
      </div>
    </div>
  )
}


