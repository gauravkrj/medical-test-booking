'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { CheckCircle, Calendar, MapPin, Phone, FileText, ArrowLeft } from 'lucide-react'
import { Booking } from '@/types'

export default function BookingConfirmationPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const bookingId = params.id as string
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    patientName: '',
    patientAge: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    bookingDate: '',
    bookingTime: '',
    notes: '',
  })

  useEffect(() => {
    if (bookingId) {
      fetchBooking()
    }
  }, [bookingId])

  const fetchBooking = async () => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`)
      if (res.ok) {
        const data = await res.json()
        setBooking(data)
        setEditForm({
          patientName: data.patientName || '',
          patientAge: String(data.patientAge || ''),
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          pincode: data.pincode || '',
          phone: data.phone || '',
          bookingDate: data.bookingDate ? new Date(data.bookingDate).toISOString().slice(0, 10) : '',
          bookingTime: data.bookingTime || '',
          notes: data.notes || '',
        })
      } else {
        router.push('/bookings')
      }
    } catch (error) {
      console.error('Error fetching booking:', error)
      router.push('/bookings')
    } finally {
      setLoading(false)
    }
  }

  const canEdit = booking && booking.bookingType === 'HOME_COLLECTION' && !['CONFIRMED','COMPLETED','CANCELLED'].includes(booking.status)
  const canCancelDirect = booking && !['CONFIRMED','SAMPLE_COLLECTED','PROCESSING','COMPLETED','CANCELLED'].includes(booking.status)

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!booking) return
    setSaving(true)
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: editForm.patientName,
          patientAge: Number(editForm.patientAge),
          address: editForm.address,
          city: editForm.city,
          state: editForm.state,
          pincode: editForm.pincode,
          phone: editForm.phone,
          bookingDate: editForm.bookingDate || undefined,
          bookingTime: editForm.bookingTime,
          notes: editForm.notes,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update booking')
      setEditing(false)
      await fetchBooking()
    } catch (err: any) {
      alert(err.message || 'Failed to update booking')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = async () => {
    if (!booking) return
    try {
      let reason: string | null = null
      const needsRequest = ['CONFIRMED','SAMPLE_COLLECTED','PROCESSING','COMPLETED'].includes(booking.status)
      if (needsRequest) {
        reason = window.prompt('Provide a reason for cancellation (optional):') || ''
      } else if (!window.confirm('Are you sure you want to cancel this booking?')) {
        return
      }
      const res = await fetch(`/api/bookings/${booking.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to cancel/request cancellation')
      await fetchBooking()
      if (data.cancelled) {
        alert('Booking cancelled successfully.')
      } else if (data.cancelRequested) {
        alert('Cancellation request sent to admin.')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to cancel/request cancellation')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Booking not found</h2>
          <Link href="/bookings">
            <Button>View My Bookings</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const statusColors = {
    PENDING: 'bg-yellow-500/20 text-yellow-400',
    CONFIRMED: 'bg-blue-500/20 text-blue-400',
    SAMPLE_COLLECTED: 'bg-purple-500/20 text-purple-400',
    PROCESSING: 'bg-orange-500/20 text-orange-400',
    COMPLETED: 'bg-emerald-500/20 text-emerald-400',
    CANCELLED: 'bg-red-500/20 text-red-400',
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/bookings" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to My Bookings
        </Link>

        <Card className="p-8">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h1>
            <p className="text-gray-400">Your booking has been successfully created</p>
            <div className="mt-4">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusColors[booking.status]}`}>
                {booking.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Booking Details */}
          <div className="space-y-6 mb-8">
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Booking Details</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-400">Booking ID</p>
                    <p className="text-white font-semibold">{booking.id}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-400">Booking Type</p>
                    <p className="text-white font-semibold">
                      {booking.bookingType === 'HOME_COLLECTION' ? 'Home Collection' : 'Clinic Visit'}
                    </p>
                  </div>
                </div>
                {booking.bookingDate && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-400">Preferred Date & Time</p>
                      <p className="text-white font-semibold">
                        {new Date(booking.bookingDate).toLocaleDateString()}
                        {booking.bookingTime && ` at ${booking.bookingTime}`}
                      </p>
                    </div>
                  </div>
                )}
                {booking.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-400">Address</p>
                      <p className="text-white font-semibold">{booking.address}</p>
                      <p className="text-gray-300 text-sm">
                        {booking.city}, {booking.state} {booking.pincode}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-400">Contact Number</p>
                    <p className="text-white font-semibold">{booking.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Patient Information */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Patient Information</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Name:</span>
                  <span className="text-white font-semibold">{booking.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Age:</span>
                  <span className="text-white font-semibold">{booking.patientAge} years</span>
                </div>
              </div>
            </div>

            {/* Tests */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Tests</h2>
              <div className="space-y-2">
                {booking.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 glass rounded-lg">
                    <div>
                      <p className="text-white font-semibold">{item.test?.name}</p>
                      {item.test?.category && (
                        <p className="text-sm text-gray-400">{item.test.category}</p>
                      )}
                    </div>
                    <p className="text-gradient font-bold">₹{item.price}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-white">Total Amount</span>
                <span className="text-3xl font-bold text-gradient">₹{booking.totalAmount}</span>
              </div>
            </div>

            {/* Prescription */}
            {booking.prescriptionUrl && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Prescription</h2>
                <a
                  href={booking.prescriptionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 glass rounded-xl hover:bg-white/10 transition-colors"
                >
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <span className="text-emerald-400 hover:text-emerald-300">View Prescription</span>
                </a>
              </div>
            )}

            {/* Notes */}
            {booking.notes && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Notes</h2>
                <p className="text-gray-300">{booking.notes}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4 pt-6 border-t border-white/10">
            <Link href="/bookings" className="md:flex-1">
              <Button className="w-full">View All Bookings</Button>
            </Link>
            <Link href="/tests">
              <Button variant="secondary" className="w-full md:w-auto">Book Another Test</Button>
            </Link>
            {/* Edit/Cancel buttons for user */}
            {booking && booking.bookingType === 'HOME_COLLECTION' && booking.status !== 'CANCELLED' && booking.status !== 'CONFIRMED' && (
              <>
                {canEdit && (
                  <Button variant="secondary" onClick={() => setEditing(true)} className="w-full md:w-auto">
                    Edit Booking
                  </Button>
                )}
                <Button variant="danger" onClick={handleCancel} className="w-full md:w-auto">
                  {canCancelDirect ? 'Cancel Booking' : 'Request Cancellation'}
                </Button>
              </>
            )}
          </div>

          {booking.status === 'CONFIRMED' && (
            <div className="mt-4 p-4 glass rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-sm text-yellow-200">
              Confirmed bookings cannot be cancelled.
            </div>
          )}
        </Card>

        {/* Edit Modal */}
        {editing && booking && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Edit Booking</h3>
              <form onSubmit={submitEdit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Patient Name" value={editForm.patientName} onChange={(e) => setEditForm({ ...editForm, patientName: e.target.value })} />
                <Input label="Patient Age" type="number" value={editForm.patientAge} onChange={(e) => setEditForm({ ...editForm, patientAge: e.target.value })} />
                <Input label="Phone" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                <Input label="Pincode" value={editForm.pincode} onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })} />
                <Input label="City" value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} />
                <Input label="State" value={editForm.state} onChange={(e) => setEditForm({ ...editForm, state: e.target.value })} />
                <div className="md:col-span-2">
                  <Input label="Address" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
                </div>
                <Input label="Preferred Date" type="date" value={editForm.bookingDate} onChange={(e) => setEditForm({ ...editForm, bookingDate: e.target.value })} />
                <Input label="Preferred Time" value={editForm.bookingTime} onChange={(e) => setEditForm({ ...editForm, bookingTime: e.target.value })} />
                <div className="md:col-span-2">
                  <Input label="Notes" value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} />
                </div>
                <div className="md:col-span-2 flex flex-col md:flex-row gap-3 justify-end pt-2">
                  <Button type="button" variant="ghost" onClick={() => setEditing(false)} className="w-full md:w-auto">Close</Button>
                  <Button type="submit" loading={saving} className="w-full md:w-auto">Save Changes</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

