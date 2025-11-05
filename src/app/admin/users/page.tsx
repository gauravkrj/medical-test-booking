'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { User, Eye, X, Calendar, Package, FileText } from 'lucide-react'

interface UserWithCount {
  id: string
  email: string
  name: string | null
  phone: string | null
  role: string
  createdAt: string
  _count: {
    bookings: number
  }
}

interface Booking {
  id: string
  bookingType: string
  patientName: string
  bookingDate: string | null
  bookingTime: string | null
  status: string
  totalAmount: number
  createdAt: string
  items: Array<{
    id: string
    price: number
    test: {
      id: string
      name: string
      category: string
      price: number
    }
  }>
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [userBookings, setUserBookings] = useState<Booking[]>([])
  const [loadingBookings, setLoadingBookings] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          setUsers(data)
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserBookings = async (userId: string) => {
    setLoadingBookings(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}/bookings`)
      if (res.ok) {
        const data = await res.json()
        setUserBookings(data)
        setSelectedUserId(userId)
      }
    } catch (error) {
      console.error('Error fetching user bookings:', error)
    } finally {
      setLoadingBookings(false)
    }
  }

  const closeBookingsModal = () => {
    setSelectedUserId(null)
    setUserBookings([])
  }

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      CONFIRMED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      SAMPLE_COLLECTED: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      PROCESSING: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      COMPLETED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
    }
    return statusColors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      </div>
    )
  }

  const selectedUser = users.find(u => u.id === selectedUserId)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">User Management</h1>
        <p className="text-gray-400">View all registered users and their bookings</p>
      </div>

      {users.length === 0 ? (
        <Card className="p-12 text-center">
          <User className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No users found</h3>
          <p className="text-gray-400">No users have registered yet</p>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Phone</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">User Since</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Bookings</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-white font-medium">
                            {user.name || 'No Name'}
                          </div>
                          <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full mt-1 ${
                            user.role === 'ADMIN'
                              ? 'bg-purple-500/20 text-purple-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{user.email}</td>
                    <td className="px-6 py-4 text-gray-300">{user.phone || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-300">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium border border-emerald-500/30">
                        <Package className="w-4 h-4" />
                        {user._count.bookings}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => fetchUserBookings(user.id)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View More
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Bookings Modal */}
      {selectedUserId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-white/10">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {selectedUser?.name || 'User'}'s Bookings
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  {selectedUser?.email} • {userBookings.length} booking{userBookings.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={closeBookingsModal}
                className="p-2 glass rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-gray-300" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loadingBookings ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              ) : userBookings.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No bookings found</h3>
                  <p className="text-gray-400">This user hasn't made any bookings yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userBookings.map((booking) => (
                    <Card key={booking.id} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-white">Booking #{booking.id.slice(0, 8)}</h3>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(booking.status)}`}>
                              {booking.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400">
                            {new Date(booking.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-emerald-400 font-bold text-lg">
                            ₹{booking.totalAmount.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Patient Name</p>
                          <p className="text-white font-medium">{booking.patientName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Booking Type</p>
                          <p className="text-white font-medium">{booking.bookingType.replace('_', ' ')}</p>
                        </div>
                        {booking.bookingDate && (
                          <div>
                            <p className="text-xs text-gray-400 mb-1">Booking Date</p>
                            <div className="flex items-center gap-1 text-white">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(booking.bookingDate).toLocaleDateString()}</span>
                              {booking.bookingTime && <span className="text-gray-400">• {booking.bookingTime}</span>}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-white/10 pt-4">
                        <p className="text-xs text-gray-400 mb-2">Tests ({booking.items.length})</p>
                        <div className="space-y-2">
                          {booking.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between glass rounded-lg p-3">
                              <div>
                                <p className="text-white font-medium">{item.test.name}</p>
                                <p className="text-xs text-gray-400">{item.test.category}</p>
                              </div>
                              <div className="text-emerald-400 font-semibold">
                                ₹{item.price.toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

