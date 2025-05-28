'use client'

import { useEffect, useMemo, useState } from 'react'
import { db } from '@/firebase/client'
import { collection, onSnapshot } from 'firebase/firestore'

export default function TopReviewKeywords() {
  const [keywords, setKeywords] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'reviews'), (snapshot) => {
      const allKeywords: string[] = []

      snapshot.forEach((doc) => {
        const data = doc.data()
        if (Array.isArray(data.keywords)) {
          allKeywords.push(...data.keywords)
        }
      })

      setKeywords(allKeywords)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const keywordCounts = useMemo(() => {
    const countMap: Record<string, number> = {}
    keywords.forEach((kw) => {
      const key = kw.toLowerCase()
      countMap[key] = (countMap[key] || 0) + 1
    })

    const sorted = Object.entries(countMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20) // Top 20 keywords

    return sorted
  }, [keywords])

  if (loading) return <p className="text-center mt-6 text-gray-500">Loading top keywords...</p>

  return (
    <div className="mt-10 p-6 rounded-xl bg-gradient-to-br from-purple-50 via-white to-purple-100 shadow-lg">
      <h2 className="text-2xl font-bold text-purple-800 mb-4">🏷️ Top Review Keywords</h2>

      <div className="flex flex-wrap gap-3">
        {keywordCounts.map(([word, count], index) => (
          <span
            key={index}
            className="inline-block bg-purple-200 text-purple-800 px-3 py-1 rounded-full text-sm font-medium shadow"
          >
            {word} ({count})
          </span>
        ))}
      </div>

      <p className="mt-4 text-sm text-gray-500 text-center">Based on real-time reviews submitted by travelers</p>
    </div>
  )
}
