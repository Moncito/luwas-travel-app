'use client'

import { useEffect, useState } from 'react'

export default function ReviewSummary({ destinationId }: { destinationId: string }) {
  const [summary, setSummary] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch(`/api/reviews/${destinationId}/summary`)
        const data = await res.json()
        setSummary(data.summary)
      } catch (err) {
        console.error("Error fetching summary:", err)
        setSummary("Failed to load summary.")
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [destinationId])

  return (
    <div className="mt-6 bg-white rounded-lg border p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-2 text-blue-700">🧠 AI Review Summary</h3>
      <p className="text-sm text-gray-700">
        {loading ? "Analyzing reviews..." : summary}
      </p>
    </div>
  )
}
