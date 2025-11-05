'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import { FlaskConical, Calendar, Users, DollarSign, TrendingUp, Clock } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalTests: 0,
    activeTests: 0,
    totalBookings: 0,
    pendingBookings: 0,
    totalUsers: 0,
    totalRevenue: 0,
  })

  useEffect(() => {
    // Fetch dashboard stats
    Promise.all([
      fetch('/api/admin/tests').then(res => res.json()),
      fetch('/api/admin/bookings').then(res => res.json()),
      fetch('/api/admin/users').then(res => res.json()),
    ])
      .then(([tests, bookings, users]) => {
        const activeTests = Array.isArray(tests) ? tests.filter((t: any) => t.isActive).length : 0
        const pendingBookings = Array.isArray(bookings) 
          ? bookings.filter((b: any) => b.status === 'PENDING').length 
          : 0
        const revenue = Array.isArray(bookings)
          ? bookings.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0)
          : 0

        setStats({
          totalTests: Array.isArray(tests) ? tests.length : 0,
          activeTests,
          totalBookings: Array.isArray(bookings) ? bookings.length : 0,
          pendingBookings,
          totalUsers: Array.isArray(users) ? users.length : 0,
          totalRevenue: revenue,
        })
      })
      .catch(console.error)
  }, [])

  const statCards = [
    {
      title: 'Total Tests',
      value: stats.totalTests,
      subtitle: `${stats.activeTests} active`,
      icon: FlaskConical,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      subtitle: `${stats.pendingBookings} pending`,
      icon: Calendar,
      color: 'from-blue-500 to-cyan-600',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      subtitle: 'Registered users',
      icon: Users,
      color: 'from-purple-500 to-pink-600',
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      subtitle: 'All time',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600',
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome to your admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-gray-400 text-sm">{stat.title}</p>
              <p className="text-gray-500 text-xs mt-1">{stat.subtitle}</p>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/tests/new"
            className="p-4 glass rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300"
          >
            <FlaskConical className="w-6 h-6 text-emerald-400 mb-2" />
            <h3 className="font-semibold text-white mb-1">Add New Test</h3>
            <p className="text-sm text-gray-400">Create a new test entry</p>
          </a>
          <a
            href="/admin/bookings"
            className="p-4 glass rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300"
          >
            <Clock className="w-6 h-6 text-blue-400 mb-2" />
            <h3 className="font-semibold text-white mb-1">View Bookings</h3>
            <p className="text-sm text-gray-400">Manage all bookings</p>
          </a>
          <a
            href="/admin/settings"
            className="p-4 glass rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300"
          >
            <TrendingUp className="w-6 h-6 text-purple-400 mb-2" />
            <h3 className="font-semibold text-white mb-1">Settings</h3>
            <p className="text-sm text-gray-400">Configure lab settings</p>
          </a>
        </div>
      </Card>
    </div>
  )
}

