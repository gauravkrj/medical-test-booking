'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Calendar, MapPin, FileText, Eye } from 'lucide-react'
import { Booking } from '@/types'

export default function UserBookingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    fetchBookings()
  }, [session, status, router])

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings', { cache: 'no-store' })
      if (res.ok) {
        const payload = await res.json()
        const data = Array.isArray(payload) ? payload : (payload?.data ?? [])
        if (Array.isArray(data)) {
          setBookings(data)
        }
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
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
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Bookings</h1>
          <p className="text-gray-400">View and track all your bookings</p>
        </div>

        {bookings.length === 0 ? (
          <Card className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No bookings yet</h3>
            <p className="text-gray-400 mb-6">Start by booking your first test</p>
            <Link href="/tests">
              <Button>Browse Tests</Button>
            </Link>
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
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {booking.bookingDate
                          ? new Date(booking.bookingDate).toLocaleDateString()
                          : 'Date not set'}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {booking.bookingType === 'HOME_COLLECTION' ? 'Home Collection' : 'Clinic Visit'}
                      </div>
                      {booking.prescriptionUrl && (
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Prescription
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gradient">₹{booking.totalAmount}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {booking.items.length} test{booking.items.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Tests List */}
                <div className="mb-4">
                  <div className="space-y-2">
                    {booking.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 glass rounded-lg">
                        <span className="text-gray-300">{item.test?.name}</span>
                        <span className="text-gray-400 text-sm">₹{item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Patient Info */}
                <div className="mb-4 text-sm">
                  <p className="text-gray-400">
                    Patient: <span className="text-white font-semibold">{booking.patientName}</span> ({booking.patientAge} years)
                  </p>
                  {booking.address && (
                    <p className="text-gray-400 mt-1">
                      {booking.address}, {booking.city}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <Link href={`/bookings/${booking.id}`} className="flex-1">
                    <Button variant="secondary" className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                  {booking.prescriptionUrl && (
                    <a
                      href={booking.prescriptionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 glass rounded-xl text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      <FileText className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

