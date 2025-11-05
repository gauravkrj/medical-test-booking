'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { CheckCircle, Calendar, MapPin, Phone, FileText, ArrowLeft } from 'lucide-react'
import { Booking } from '@/types'

export default function BookingConfirmationPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const bookingId = params.id as string
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)

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
          <div className="flex items-center gap-4 pt-6 border-t border-white/10">
            <Link href="/bookings" className="flex-1">
              <Button className="w-full">View All Bookings</Button>
            </Link>
            <Link href="/tests">
              <Button variant="secondary">Book Another Test</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}

