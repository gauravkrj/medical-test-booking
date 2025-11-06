'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import { TestType } from '@/types'
import { Plus, X } from 'lucide-react'

export default function NewTestPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        duration: formData.duration ? parseInt(formData.duration) : null,
        faqsJson: faqs.length > 0 ? faqs : null,
      }

      // Use /add route (no conflict with page route)
      const endpoint = '/api/admin/tests/add'

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        router.push('/admin/tests')
      } else {
        let message = `Failed to create test (HTTP ${res.status})`
        const ct = res.headers.get('content-type') || ''
        try {
          if (ct.includes('application/json')) {
            const error = await res.json()
            if (error?.error) message = error.error
          } else {
            const text = await res.text()
            if (text) message = `${message}: ${text.substring(0, 200)}`
          }
        } catch {}
        alert(message)
      }
    } catch (error) {
      console.error('Error creating test:', error)
      alert('Failed to create test')
    } finally {
      setLoading(false)
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

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Create New Test</h1>
        <p className="text-gray-400">Add a new test to your lab</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-8 space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Test Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Complete Blood Count"
              />
              <Input
                label="Category *"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                placeholder="e.g., Blood Test"
              />
              <Input
                label="Price (₹) *"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                placeholder="500"
              />
              <Input
                label="Result Duration (days)"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="1"
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
                placeholder="Brief description of the test..."
              />
            </div>
          </div>

          {/* Rich Content Sections */}
          <div className="pt-6 border-t border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">Detailed Information</h2>
            <div className="space-y-6">
              <Textarea
                label="About"
                value={formData.about}
                onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                rows={6}
                placeholder="Detailed information about this test..."
              />
              <Textarea
                label="Parameters"
                value={formData.parameters}
                onChange={(e) => setFormData({ ...formData, parameters: e.target.value })}
                rows={6}
                placeholder="What parameters are tested..."
              />
              <Textarea
                label="Preparation"
                value={formData.preparation}
                onChange={(e) => setFormData({ ...formData, preparation: e.target.value })}
                rows={6}
                placeholder="How to prepare for this test..."
              />
              <Textarea
                label="Why This Test?"
                value={formData.why}
                onChange={(e) => setFormData({ ...formData, why: e.target.value })}
                rows={6}
                placeholder="Why should someone take this test..."
              />
              <Textarea
                label="Interpretations"
                value={formData.interpretations}
                onChange={(e) => setFormData({ ...formData, interpretations: e.target.value })}
                rows={6}
                placeholder="How to interpret the results..."
              />
            </div>
          </div>

          {/* FAQs */}
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
                    placeholder="Enter question..."
                  />
                  <Textarea
                    label="Answer"
                    value={newFaq.answer}
                    onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                    rows={3}
                    placeholder="Enter answer..."
                  />
                  <Button type="button" variant="secondary" onClick={addFaq}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add FAQ
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-4 pt-6 border-t border-white/10">
            <Button type="submit" loading={loading}>
              Create Test
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

