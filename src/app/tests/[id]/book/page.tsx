'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import { ArrowLeft, Upload, X, FileText } from 'lucide-react'
import { Test, BookingType } from '@/types'

export default function BookTestPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const testId = params.id as string
  const [test, setTest] = useState<Test | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    bookingType: BookingType.CLINIC_VISIT,
    patientName: '',
    patientAge: '',
    bookingDate: '',
    bookingTime: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    notes: '',
  })
  const [prescriptionUrl, setPrescriptionUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    if (testId) {
      fetchTest()
    }
  }, [testId, session, status, router])

  const fetchTest = async () => {
    try {
      const res = await fetch(`/api/tests/${testId}`)
      if (res.ok) {
        const data = await res.json()
        setTest(data)
      } else {
        router.push('/tests')
      }
    } catch (error) {
      console.error('Error fetching test:', error)
      router.push('/tests')
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
        setPrescriptionUrl(data.url)
      } else {
        alert('Failed to upload prescription')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Failed to upload prescription')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Ensure cookies are sent with the request
        body: JSON.stringify({
          ...formData,
          patientAge: parseInt(formData.patientAge),
          prescriptionUrl,
          testIds: [testId],
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        // API returns { success: true, data: booking }
        router.push(`/bookings/${data.data.id}`)
      } else {
        // Handle error response
        const errorMessage = data.message || data.error || 'Failed to create booking'
        const errorDetails = data.details
        console.error('Booking error:', errorMessage, errorDetails)
        alert(errorMessage)
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      alert('Failed to create booking. Please try again.')
    } finally {
      setSubmitting(false)
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

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Test not found</h2>
          <Link href="/tests">
            <Button>Back to Tests</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href={`/tests/${testId}`} className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Test Details
        </Link>

        <Card className="p-8">
          <h1 className="text-3xl font-bold text-white mb-2">Book Test</h1>
          <p className="text-gray-400 mb-8">{test.name}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Booking Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-3">
                Booking Type *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, bookingType: BookingType.CLINIC_VISIT })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.bookingType === BookingType.CLINIC_VISIT
                      ? 'border-emerald-500 bg-emerald-500/10 text-white'
                      : 'border-white/10 glass text-gray-300 hover:border-white/20'
                  }`}
                >
                  <div className="font-semibold">Clinic Visit</div>
                  <div className="text-xs mt-1">Visit our lab</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, bookingType: BookingType.HOME_COLLECTION })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.bookingType === BookingType.HOME_COLLECTION
                      ? 'border-emerald-500 bg-emerald-500/10 text-white'
                      : 'border-white/10 glass text-gray-300 hover:border-white/20'
                  }`}
                >
                  <div className="font-semibold">Home Collection</div>
                  <div className="text-xs mt-1">Sample collection at home</div>
                </button>
              </div>
            </div>

            {/* Patient Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Patient Name *"
                value={formData.patientName}
                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                required
              />
              <Input
                label="Patient Age *"
                type="number"
                value={formData.patientAge}
                onChange={(e) => setFormData({ ...formData, patientAge: e.target.value })}
                required
                min="1"
              />
              <Input
                label="Phone Number *"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
              <Input
                label="City *"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
              <Input
                label="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
              <Input
                label="Pincode"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              />
            </div>

            {/* Booking Date/Time */}
            {formData.bookingType === BookingType.CLINIC_VISIT && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Preferred Date"
                  type="date"
                  value={formData.bookingDate}
                  onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
                <Input
                  label="Preferred Time"
                  type="time"
                  value={formData.bookingTime}
                  onChange={(e) => setFormData({ ...formData, bookingTime: e.target.value })}
                />
              </div>
            )}

            {/* Address (for home collection) */}
            {formData.bookingType === BookingType.HOME_COLLECTION && (
              <div>
                <Textarea
                  label="Full Address *"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={4}
                  required={formData.bookingType === BookingType.HOME_COLLECTION}
                  placeholder="Enter complete address for sample collection"
                />
              </div>
            )}

            {/* Prescription Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Prescription (Optional)
              </label>
              {prescriptionUrl ? (
                <div className="flex items-center gap-4 p-4 glass rounded-xl">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <a
                    href={prescriptionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-emerald-400 hover:text-emerald-300 truncate"
                  >
                    Prescription uploaded
                  </a>
                  <button
                    type="button"
                    onClick={() => setPrescriptionUrl(null)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <label className="block p-4 glass rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <Upload className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-300">
                      {uploading ? 'Uploading...' : 'Upload Prescription'}
                    </span>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept="image/*,.pdf"
                    disabled={uploading}
                  />
                </label>
              )}
            </div>

            {/* Notes */}
            <Textarea
              label="Additional Notes (Optional)"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Any special instructions or notes..."
            />

            {/* Summary */}
            <Card className="p-6 bg-white/5">
              <h3 className="font-semibold text-white mb-4">Booking Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Test:</span>
                  <span className="font-semibold text-white">{test.name}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Price:</span>
                  <span className="font-semibold text-gradient text-lg">₹{test.price}</span>
                </div>
              </div>
            </Card>

            {/* Submit */}
            <div className="flex items-center gap-4 pt-4">
              <Button type="submit" loading={submitting} size="lg" className="flex-1">
                Confirm Booking
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}

