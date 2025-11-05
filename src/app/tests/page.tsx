'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { FlaskConical, Search, ArrowRight } from 'lucide-react'
import { Test } from '@/types'

export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    fetchTests()
  }, [])

  useEffect(() => {
    if (tests.length > 0) {
      const uniqueCategories = Array.from(new Set(tests.map(t => t.category)))
      setCategories(uniqueCategories)
    }
  }, [tests])

  const fetchTests = async () => {
    try {
      const res = await fetch('/api/tests')
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

  const filteredTests = tests.filter(test => {
    const matchesSearch = searchQuery === '' || 
      test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || test.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-white mb-4">
            Available Tests
          </h1>
          <p className="text-xl text-gray-400">
            Browse our comprehensive range of medical tests
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search tests by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                selectedCategory === 'all'
                  ? 'gradient-primary text-white'
                  : 'glass text-gray-300 border border-white/10 hover:bg-white/10'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  selectedCategory === category
                    ? 'gradient-primary text-white'
                    : 'glass text-gray-300 border border-white/10 hover:bg-white/10'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Tests Grid */}
        {filteredTests.length === 0 ? (
          <Card className="p-12 text-center">
            <FlaskConical className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No tests found</h3>
            <p className="text-gray-400">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your search or filter'
                : 'No tests available at the moment'}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map((test) => (
              <Card key={test.id} className="p-6 hover:scale-105 transition-transform duration-300">
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-white">{test.name}</h3>
                    <span className="px-2 py-1 text-xs font-semibold bg-emerald-500/20 text-emerald-400 rounded-full">
                      {test.category}
                    </span>
                  </div>
                  {test.description && (
                    <p className="text-sm text-gray-300 line-clamp-2 mb-4">
                      {test.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gradient">₹{test.price}</p>
                      {test.duration && (
                        <p className="text-xs text-gray-400">Results in {test.duration} day(s)</p>
                      )}
                    </div>
                  </div>
                </div>
                <Link href={`/tests/${test.id}`}>
                  <Button className="w-full">
                    View Details
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

