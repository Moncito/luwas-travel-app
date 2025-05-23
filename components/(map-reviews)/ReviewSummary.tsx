'use client'

import { useEffect, useState } from 'react'

interface Props {
  destinationId: string
}

export default function ReviewSummary({ destinationId }: Props) {
  const [summary, setSummary] = useState<string | null>(null)
  const [keywords, setKeywords] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch(`/api/reviews/summary?destinationId=${destinationId}`)
        const data = await res.json()

        setSummary(data.summary || 'No summary available.')
        setKeywords(data.keywords || [])
      } catch (err) {
        console.error('Failed to fetch summary:', err)
        setSummary('Summary currently unavailable. Please check back later.')
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [destinationId])

  if (loading) {
    return <p className="text-sm text-gray-500">Loading review summary...</p>
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-3">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">🧠 AI Review Summary</h3>

      <p className="text-sm text-gray-700">{summary}</p>

      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {keywords.map((kw, i) => (
            <span key={i} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              #{kw}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
