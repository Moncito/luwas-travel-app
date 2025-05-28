'use client'

import { useEffect, useState } from 'react'

export default function OpenAISummary({
  name,
  location,
}: {
  name: string
  location: string
}) {
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAI = async () => {
      try {
        const res = await fetch('/api/ai/review-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, location }),
        })
        const json = await res.json()
        setSummary(json.summary || '')
      } catch (err) {
        console.error('AI fallback failed:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAI()
  }, [name, location])

  if (loading || !summary) return null

  return (
    <section className="max-w-6xl mx-auto px-6 mt-12">
      <h2 className="text-2xl font-bold mb-4">Community Insights</h2>
      <div className="bg-white p-6 rounded-xl shadow text-sm text-gray-700 italic">
        {summary}
      </div>
    </section>
  )
}
