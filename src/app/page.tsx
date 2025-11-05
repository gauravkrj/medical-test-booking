'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { FlaskConical, Calendar, Clock, Shield, ArrowRight } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function HomePage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState({
    totalTests: 0,
    totalBookings: 0,
  })

  useEffect(() => {
    // Fetch stats
    fetch('/api/tests')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setStats(prev => ({ ...prev, totalTests: data.length }))
        }
      })
      .catch(console.error)
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 via-teal-950/20 to-green-950/20"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
              <span className="text-gradient">Book Medical Tests</span>
              <br />
              <span className="text-white">With Ease</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Fast, reliable, and convenient medical test booking. Choose from our comprehensive range of tests and book online.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/tests">
                <Button size="lg" className="text-lg px-8 py-4">
                  Browse Tests
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              {!session && (
                <Link href="/signup">
                  <Button variant="secondary" size="lg" className="text-lg px-8 py-4">
                    Create Account
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Choose Us?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center">
              <div className="w-16 h-16 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Easy Booking</h3>
              <p className="text-gray-400">
                Book your tests online in just a few clicks. No need to visit in person.
              </p>
            </Card>

            <Card className="p-8 text-center">
              <div className="w-16 h-16 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Fast Results</h3>
              <p className="text-gray-400">
                Get your test results quickly and securely through our platform.
              </p>
            </Card>

            <Card className="p-8 text-center">
              <div className="w-16 h-16 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Secure & Private</h3>
              <p className="text-gray-400">
                Your data and test results are kept secure and confidential.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Card className="p-12">
            <div className="grid md:grid-cols-2 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold text-gradient mb-2">
                  {stats.totalTests}+
                </div>
                <div className="text-gray-400 text-lg">Available Tests</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-gradient mb-2">
                  {stats.totalBookings}+
                </div>
                <div className="text-gray-400 text-lg">Bookings Completed</div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}
