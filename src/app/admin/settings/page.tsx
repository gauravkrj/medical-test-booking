'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import { Upload, Save } from 'lucide-react'
import { SiteConfig } from '@/types'

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<SiteConfig>>({
    labName: '',
    labAddress: '',
    labCity: '',
    labState: '',
    labPincode: '',
    labPhone: '',
    labEmail: '',
    labLogoUrl: null,
    primaryColor: null,
    secondaryColor: null,
    aboutText: null,
    termsText: null,
    privacyText: null,
  })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings')
      if (res.ok) {
        const data = await res.json()
        setFormData(data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        setFormData({ ...formData, labLogoUrl: data.url })
      } else {
        alert('Failed to upload logo')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Failed to upload logo')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        alert('Settings saved successfully!')
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Lab Settings</h1>
        <p className="text-gray-400">Configure your lab information and branding</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-8 space-y-8">
          {/* Lab Information */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Lab Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Lab Name *"
                value={formData.labName || ''}
                onChange={(e) => setFormData({ ...formData, labName: e.target.value })}
                required
              />
              <Input
                label="Lab Phone *"
                value={formData.labPhone || ''}
                onChange={(e) => setFormData({ ...formData, labPhone: e.target.value })}
                required
              />
              <Input
                label="Lab Email *"
                type="email"
                value={formData.labEmail || ''}
                onChange={(e) => setFormData({ ...formData, labEmail: e.target.value })}
                required
              />
            </div>
            <div className="mt-6">
              <Textarea
                label="Lab Address *"
                value={formData.labAddress || ''}
                onChange={(e) => setFormData({ ...formData, labAddress: e.target.value })}
                rows={3}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <Input
                label="City *"
                value={formData.labCity || ''}
                onChange={(e) => setFormData({ ...formData, labCity: e.target.value })}
                required
              />
              <Input
                label="State *"
                value={formData.labState || ''}
                onChange={(e) => setFormData({ ...formData, labState: e.target.value })}
                required
              />
              <Input
                label="Pincode *"
                value={formData.labPincode || ''}
                onChange={(e) => setFormData({ ...formData, labPincode: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Logo Upload */}
          <div className="pt-6 border-t border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">Branding</h2>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Lab Logo</label>
              {formData.labLogoUrl ? (
                <div className="flex items-center gap-4">
                  <img
                    src={formData.labLogoUrl}
                    alt="Lab Logo"
                    className="w-32 h-32 object-contain rounded-xl"
                  />
                  <div>
                    <label className="block p-3 glass rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-2">
                        <Upload className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300 text-sm">
                          {uploading ? 'Uploading...' : 'Change Logo'}
                        </span>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileUpload}
                        accept="image/*"
                        disabled={uploading}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, labLogoUrl: null })}
                      className="mt-2 text-sm text-red-400 hover:text-red-300"
                    >
                      Remove Logo
                    </button>
                  </div>
                </div>
              ) : (
                <label className="block p-6 glass rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-colors text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-gray-300">
                    {uploading ? 'Uploading...' : 'Upload Logo'}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept="image/*"
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Input
                label="Primary Color (Hex)"
                value={formData.primaryColor || ''}
                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value || null })}
                placeholder="#10b981"
              />
              <Input
                label="Secondary Color (Hex)"
                value={formData.secondaryColor || ''}
                onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value || null })}
                placeholder="#14b8a6"
              />
            </div>
          </div>

          {/* Content */}
          <div className="pt-6 border-t border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">Content</h2>
            <div className="space-y-6">
              <Textarea
                label="About Text"
                value={formData.aboutText || ''}
                onChange={(e) => setFormData({ ...formData, aboutText: e.target.value || null })}
                rows={6}
                placeholder="About your lab..."
              />
              <Textarea
                label="Terms & Conditions"
                value={formData.termsText || ''}
                onChange={(e) => setFormData({ ...formData, termsText: e.target.value || null })}
                rows={8}
                placeholder="Terms and conditions..."
              />
              <Textarea
                label="Privacy Policy"
                value={formData.privacyText || ''}
                onChange={(e) => setFormData({ ...formData, privacyText: e.target.value || null })}
                rows={8}
                placeholder="Privacy policy..."
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-4 pt-6 border-t border-white/10">
            <Button type="submit" loading={saving} size="lg">
              <Save className="w-5 h-5 mr-2" />
              Save Settings
            </Button>
          </div>
        </Card>
      </form>
    </div>
  )
}

