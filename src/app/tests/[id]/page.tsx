'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { FlaskConical, ArrowLeft, ChevronDown, ChevronUp, BookOpen } from 'lucide-react'
import { Test } from '@/types'
import { useSession } from 'next-auth/react'

export default function TestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const testId = params.id as string
  const [test, setTest] = useState<Test | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  useEffect(() => {
    if (testId) {
      fetchTest()
    }
  }, [testId])

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      </div>
    )
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

  const faqs = test.faqsJson && Array.isArray(test.faqsJson) ? test.faqsJson : []

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link href="/tests" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Tests
        </Link>

        {/* Test Header */}
        <Card className="p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
                  <FlaskConical className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">{test.name}</h1>
                  <span className="px-3 py-1 text-sm font-semibold bg-emerald-500/20 text-emerald-400 rounded-full">
                    {test.category}
                  </span>
                </div>
              </div>
              {test.description && (
                <p className="text-lg text-gray-300 mb-6">{test.description}</p>
              )}
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Price</p>
                  <p className="text-3xl font-bold text-gradient">₹{test.price}</p>
                </div>
                {test.duration && (
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Result Duration</p>
                    <p className="text-xl font-semibold text-white">{test.duration} day(s)</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-400 mb-1">Type</p>
                  <p className="text-xl font-semibold text-white">
                    {test.testType === 'HOME_TEST' ? 'Home Test' : 'Clinic Test'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {session ? (
            <Link href={`/tests/${test.id}/book`} className="inline-block">
              <Button size="lg" className="text-lg px-8">
                <BookOpen className="w-5 h-5 mr-2" />
                Book Now
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button size="lg" className="text-lg px-8">
                <BookOpen className="w-5 h-5 mr-2" />
                Login to Book
              </Button>
            </Link>
          )}
        </Card>

        {/* About Section */}
        {test.about && (
          <Card className="p-8 mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">About This Test</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 whitespace-pre-line">{test.about}</p>
            </div>
          </Card>
        )}

        {/* Parameters Section */}
        {test.parameters && (
          <Card className="p-8 mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">Parameters Tested</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 whitespace-pre-line">{test.parameters}</p>
            </div>
          </Card>
        )}

        {/* Preparation Section */}
        {test.preparation && (
          <Card className="p-8 mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">Preparation</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 whitespace-pre-line">{test.preparation}</p>
            </div>
          </Card>
        )}

        {/* Why Section */}
        {test.why && (
          <Card className="p-8 mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">Why This Test?</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 whitespace-pre-line">{test.why}</p>
            </div>
          </Card>
        )}

        {/* Interpretations Section */}
        {test.interpretations && (
          <Card className="p-8 mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">Understanding Results</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 whitespace-pre-line">{test.interpretations}</p>
            </div>
          </Card>
        )}

        {/* FAQs Section */}
        {faqs.length > 0 && (
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-white/10 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                  >
                    <span className="font-semibold text-white pr-4">{faq.question}</span>
                    {expandedFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {expandedFaq === index && (
                    <div className="px-6 py-4 bg-white/5 border-t border-white/10">
                      <p className="text-gray-300">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

