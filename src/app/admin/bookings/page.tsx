'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Calendar, MapPin, User, FileText, Filter, CheckCircle } from 'lucide-react'
import { Booking, BookingStatus, BookingType } from '@/types'

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    bookingType: '',
  })

  useEffect(() => {
    fetchBookings()
  }, [filters])

  const fetchBookings = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.bookingType) params.append('bookingType', filters.bookingType)

      const res = await fetch(`/api/admin/bookings?${params.toString()}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setBookings(data)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        fetchBookings()
      } else {
        alert('Failed to update booking status')
      }
    } catch (error) {
      console.error('Error updating booking:', error)
      alert('Failed to update booking status')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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

  const statusOptions: BookingStatus[] = [
    'PENDING',
    'CONFIRMED',
    'SAMPLE_COLLECTED',
    'PROCESSING',
    'COMPLETED',
    'CANCELLED',
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Booking Management</h1>
        <p className="text-gray-400">Manage all bookings and their statuses</p>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-white">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-3 glass rounded-xl text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                paddingRight: '2.5rem',
              }}
            >
              <option value="" className="bg-slate-900 text-gray-300">All Statuses</option>
              {statusOptions.map((status) => (
                <option key={status} value={status} className="bg-slate-900 text-white">
                  {status.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Booking Type</label>
            <select
              value={filters.bookingType}
              onChange={(e) => setFilters({ ...filters, bookingType: e.target.value })}
              className="w-full px-4 py-3 glass rounded-xl text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                paddingRight: '2.5rem',
              }}
            >
              <option value="" className="bg-slate-900 text-gray-300">All Types</option>
              <option value={BookingType.CLINIC_VISIT} className="bg-slate-900 text-white">Clinic Visit</option>
              <option value={BookingType.HOME_COLLECTION} className="bg-slate-900 text-white">Home Collection</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <Card className="p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No bookings found</h3>
          <p className="text-gray-400">Try adjusting your filters</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <Card key={booking.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">
                      Booking #{booking.id.slice(0, 8)}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[booking.status]}`}>
                      {booking.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400 mb-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{booking.user?.name || booking.user?.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {booking.bookingDate
                          ? new Date(booking.bookingDate).toLocaleDateString()
                          : 'Date not set'}
                        {booking.bookingTime && ` at ${booking.bookingTime}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {booking.bookingType === 'HOME_COLLECTION' ? 'Home Collection' : 'Clinic Visit'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Phone:</span>
                      <span className="text-white">{booking.phone}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gradient">₹{booking.totalAmount}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {booking.items.length} test{booking.items.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Patient Info */}
              <div className="mb-4 p-4 glass rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Patient</p>
                <p className="text-white font-semibold">{booking.patientName} ({booking.patientAge} years)</p>
                {booking.address && (
                  <p className="text-gray-300 text-sm mt-1">
                    {booking.address}, {booking.city}{booking.state && `, ${booking.state}`} {booking.pincode}
                  </p>
                )}
              </div>

              {/* Tests */}
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-300 mb-2">Tests</p>
                <div className="space-y-2">
                  {booking.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 glass rounded-lg">
                      <span className="text-gray-300">{item.test?.name}</span>
                      <span className="text-gray-400 text-sm">₹{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prescription */}
              {booking.prescriptionUrl && (
                <div className="mb-4">
                  <a
                    href={booking.prescriptionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300"
                  >
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">View Prescription</span>
                  </a>
                </div>
              )}

              {/* Status Update */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Update Status</label>
                  <select
                    value={booking.status}
                    onChange={(e) => updateBookingStatus(booking.id, e.target.value as BookingStatus)}
                    className="w-full px-4 py-2 glass rounded-xl text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      paddingRight: '2.5rem',
                    }}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status} className="bg-slate-900 text-white">
                        {status.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <a
                  href={`/bookings/${booking.id}`}
                  className="px-4 py-2 glass rounded-xl text-emerald-400 hover:text-emerald-300 transition-colors"
                  title="View Details"
                >
                  <CheckCircle className="w-5 h-5" />
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

