'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { FlaskConical, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { Test } from '@/types'

export default function AdminTestsPage() {
  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTests()
  }, [])

  const fetchTests = async () => {
    try {
      const res = await fetch('/api/admin/tests')
      const data = await res.json()
      if (Array.isArray(data)) {
        setTests(data)
      }
    } catch (error) {
      console.error('Error fetching tests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this test?')) return

    try {
      const res = await fetch(`/api/admin/tests/${id}`, {
        method: 'DELETE',
      })
      
      if (res.ok) {
        fetchTests()
      } else {
        alert('Failed to delete test')
      }
    } catch (error) {
      console.error('Error deleting test:', error)
      alert('Failed to delete test')
    }
  }

  const handleToggleActive = async (test: Test) => {
    try {
      const res = await fetch(`/api/admin/tests/${test.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !test.isActive }),
      })

      if (res.ok) {
        fetchTests()
      } else {
        alert('Failed to update test')
      }
    } catch (error) {
      console.error('Error updating test:', error)
      alert('Failed to update test')
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
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Test Management</h1>
          <p className="text-sm md:text-base text-gray-400">Manage all available tests</p>
        </div>
        <Link href="/admin/tests/new" className="w-full md:w-auto">
          <Button className="w-full md:w-auto">
            <Plus className="w-4 h-4 md:w-5 md:h-5 mr-2" />
            Add New Test
          </Button>
        </Link>
      </div>

      {tests.length === 0 ? (
        <Card className="p-8 md:p-12 text-center">
          <FlaskConical className="w-12 h-12 md:w-16 md:h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg md:text-xl font-semibold text-white mb-2">No tests found</h3>
          <p className="text-sm md:text-base text-gray-400 mb-6">Get started by adding your first test</p>
          <Link href="/admin/tests/new">
            <Button>Create First Test</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {tests.map((test) => (
            <Card key={test.id} className="p-4 md:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-lg md:text-xl font-bold text-white truncate">{test.name}</h3>
                    {test.isActive ? (
                      <span className="px-2 py-1 text-xs font-semibold bg-emerald-500/20 text-emerald-400 rounded-full flex-shrink-0">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold bg-gray-500/20 text-gray-400 rounded-full flex-shrink-0">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{test.category}</p>
                  <p className="text-xl md:text-2xl font-bold text-gradient">₹{test.price}</p>
                </div>
              </div>

              {test.description && (
                <p className="text-sm text-gray-300 mb-4 line-clamp-2">
                  {test.description}
                </p>
              )}

              <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                <Link href={`/admin/tests/${test.id}/edit`} className="flex-1">
                  <Button variant="secondary" size="sm" className="w-full text-xs md:text-sm">
                    <Edit className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleActive(test)}
                  title={test.isActive ? 'Deactivate' : 'Activate'}
                  className="p-2"
                >
                  {test.isActive ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(test.id)}
                  className="p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

