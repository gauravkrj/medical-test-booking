'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { User, Edit, Lock, Save, X } from 'lucide-react'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [activeTab, setActiveTab] = useState<'view' | 'edit' | 'password'>('view')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    createdAt: '',
  })

  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    fetchProfile()
  }, [session, status, router])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile')
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
        setEditForm({
          name: data.name || '',
          phone: data.phone || '',
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })

      const data = await res.json()

      if (res.ok) {
        setProfile(data)
        setSuccess('Profile updated successfully!')
        setActiveTab('view')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || 'Failed to update profile')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setChangingPassword(true)

    try {
      const res = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess('Password changed successfully! Please sign in again with your new password.')
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
        // Sign out user after password change and redirect to login
        setTimeout(async () => {
          await signOut({ redirect: false })
          router.push('/login')
          router.refresh()
        }, 2000)
      } else {
        setError(data.error || 'Failed to change password')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setChangingPassword(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl md:max-w-4xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">My Profile</h1>
          <p className="text-sm md:text-base text-gray-400">Manage your account information and settings</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap md:flex-nowrap gap-2 md:gap-0 mb-6 border-b border-white/10 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('view')}
            className={`px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base font-medium whitespace-nowrap transition-colors ${
              activeTab === 'view'
                ? 'text-white border-b-2 border-emerald-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              View Profile
            </div>
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base font-medium whitespace-nowrap transition-colors ${
              activeTab === 'edit'
                ? 'text-white border-b-2 border-emerald-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Edit Profile
            </div>
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base font-medium whitespace-nowrap transition-colors ${
              activeTab === 'password'
                ? 'text-white border-b-2 border-emerald-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Change Password
            </div>
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 md:mb-6 glass rounded-xl p-3 md:p-4 border border-red-500/30 bg-red-500/10">
            <span className="text-red-300 text-sm">{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 md:mb-6 glass rounded-xl p-3 md:p-4 border border-emerald-500/30 bg-emerald-500/10">
            <span className="text-emerald-300 text-sm">{success}</span>
          </div>
        )}

        {/* View Profile Tab */}
        {activeTab === 'view' && (
          <Card className="p-4 md:p-8">
            <div className="space-y-6">
              <div className="flex items-center justify-center mb-6 md:mb-8">
                <div className="w-20 h-20 md:w-24 md:h-24 gradient-primary rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 md:w-12 md:h-12 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="text-xs md:text-sm font-medium text-gray-400 mb-2 block">Full Name</label>
                  <p className="text-white text-base md:text-lg break-words">{profile.name || 'Not set'}</p>
                </div>
                <div>
                  <label className="text-xs md:text-sm font-medium text-gray-400 mb-2 block">Email</label>
                  <p className="text-white text-base md:text-lg break-words">{profile.email}</p>
                </div>
                <div>
                  <label className="text-xs md:text-sm font-medium text-gray-400 mb-2 block">Phone</label>
                  <p className="text-white text-base md:text-lg break-words">{profile.phone || 'Not set'}</p>
                </div>
                <div>
                  <label className="text-xs md:text-sm font-medium text-gray-400 mb-2 block">Role</label>
                  <span className="inline-block px-3 py-1 rounded-full text-xs md:text-sm font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {profile.role}
                  </span>
                </div>
                <div>
                  <label className="text-xs md:text-sm font-medium text-gray-400 mb-2 block">Member Since</label>
                  <p className="text-white text-base md:text-lg">
                    {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="pt-4 md:pt-6 border-t border-white/10">
                <Button
                  onClick={() => setActiveTab('edit')}
                  className="w-full md:w-auto"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Edit Profile Tab */}
        {activeTab === 'edit' && (
          <Card className="p-4 md:p-8">
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <Input
                label="Full Name"
                type="text"
                placeholder="John Doe"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
              <Input
                label="Email"
                type="email"
                value={profile.email}
                disabled
                hint="Email cannot be changed"
              />
              <Input
                label="Phone Number"
                type="tel"
                placeholder="+1 234 567 8900"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />

              <div className="flex flex-col md:flex-row gap-3 md:gap-4 pt-2 md:pt-4">
                <Button type="submit" loading={saving} className="w-full md:flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setEditForm({
                      name: profile.name || '',
                      phone: profile.phone || '',
                    })
                    setActiveTab('view')
                  }}
                  className="w-full md:w-auto"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Change Password Tab */}
        {activeTab === 'password' && (
          <Card className="p-4 md:p-8">
            <form onSubmit={handleChangePassword} className="space-y-6">
              <Input
                label="Current Password"
                type="password"
                placeholder="Enter your current password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                required
              />
              <Input
                label="New Password"
                type="password"
                placeholder="Enter new password (min 6 characters)"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required
                hint="Must be at least 6 characters"
              />
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Confirm your new password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                required
              />

              <div className="flex flex-col md:flex-row gap-3 md:gap-4 pt-2 md:pt-4">
                <Button type="submit" loading={changingPassword} className="w-full md:flex-1">
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setPasswordForm({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    })
                    setActiveTab('view')
                  }}
                  className="w-full md:w-auto"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  )
}

