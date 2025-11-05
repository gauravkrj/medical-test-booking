'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import { TestType, Test } from '@/types'
import { Plus, X } from 'lucide-react'

export default function EditTestPage() {
  const router = useRouter()
  const params = useParams()
  const testId = params.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    duration: '',
    testType: TestType.CLINIC_TEST,
    isActive: true,
    about: '',
    parameters: '',
    preparation: '',
    why: '',
    interpretations: '',
  })
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>([])
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' })

  useEffect(() => {
    if (testId) {
      fetchTest()
    }
  }, [testId])

  const fetchTest = async () => {
    try {
      const res = await fetch(`/api/admin/tests/${testId}`)
      if (res.ok) {
        const test: Test = await res.json()
        setFormData({
          name: test.name,
          description: test.description || '',
          category: test.category,
          price: test.price.toString(),
          duration: test.duration?.toString() || '',
          testType: test.testType,
          isActive: test.isActive,
          about: test.about || '',
          parameters: test.parameters || '',
          preparation: test.preparation || '',
          why: test.why || '',
          interpretations: test.interpretations || '',
        })
        if (test.faqsJson && Array.isArray(test.faqsJson)) {
          setFaqs(test.faqsJson)
        }
      } else {
        alert('Failed to load test')
        router.push('/admin/tests')
      }
    } catch (error) {
      console.error('Error fetching test:', error)
      alert('Failed to load test')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        duration: formData.duration ? parseInt(formData.duration) : null,
        faqsJson: faqs.length > 0 ? faqs : null,
      }

      const res = await fetch(`/api/admin/tests/${testId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        router.push('/admin/tests')
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to update test')
      }
    } catch (error) {
      console.error('Error updating test:', error)
      alert('Failed to update test')
    } finally {
      setSaving(false)
    }
  }

  const addFaq = () => {
    if (newFaq.question && newFaq.answer) {
      setFaqs([...faqs, newFaq])
      setNewFaq({ question: '', answer: '' })
    }
  }

  const removeFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Edit Test</h1>
        <p className="text-gray-400">Update test information</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-8 space-y-6">
          {/* Same form structure as new page */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Test Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="Category *"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
              <Input
                label="Price (₹) *"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
              <Input
                label="Result Duration (days)"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              />
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Test Type *
                </label>
                <select
                  value={formData.testType}
                  onChange={(e) => setFormData({ ...formData, testType: e.target.value as TestType })}
                  className="w-full px-4 py-3.5 glass rounded-xl text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  required
                >
                  <option value={TestType.CLINIC_TEST}>Clinic Test</option>
                  <option value={TestType.HOME_TEST}>Home Test</option>
                </select>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20 bg-white/10 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-semibold text-gray-300">Active</span>
                </label>
              </div>
            </div>
            <div className="mt-6">
              <Textarea
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>
          </div>

          <div className="pt-6 border-t border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">Detailed Information</h2>
            <div className="space-y-6">
              <Textarea
                label="About"
                value={formData.about}
                onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                rows={6}
              />
              <Textarea
                label="Parameters"
                value={formData.parameters}
                onChange={(e) => setFormData({ ...formData, parameters: e.target.value })}
                rows={6}
              />
              <Textarea
                label="Preparation"
                value={formData.preparation}
                onChange={(e) => setFormData({ ...formData, preparation: e.target.value })}
                rows={6}
              />
              <Textarea
                label="Why This Test?"
                value={formData.why}
                onChange={(e) => setFormData({ ...formData, why: e.target.value })}
                rows={6}
              />
              <Textarea
                label="Interpretations"
                value={formData.interpretations}
                onChange={(e) => setFormData({ ...formData, interpretations: e.target.value })}
                rows={6}
              />
            </div>
          </div>

          <div className="pt-6 border-t border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-white mb-1">{faq.question}</p>
                      <p className="text-sm text-gray-300">{faq.answer}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFaq(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </Card>
              ))}
              <Card className="p-4">
                <div className="space-y-4">
                  <Input
                    label="Question"
                    value={newFaq.question}
                    onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                  />
                  <Textarea
                    label="Answer"
                    value={newFaq.answer}
                    onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                    rows={3}
                  />
                  <Button type="button" variant="secondary" onClick={addFaq}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add FAQ
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-6 border-t border-white/10">
            <Button type="submit" loading={saving}>
              Update Test
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </Card>
      </form>
    </div>
  )
}

