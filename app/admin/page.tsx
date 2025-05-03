// app/admin/page.tsx
'use client'

import { useEffect, useState } from 'react'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setLoading(false), 500) // simulate loading
  }, [])

  if (loading) return <p className="text-center mt-20">Loading Admin Dashboard...</p>

  return (
    <main className="min-h-screen px-6 py-20">
      <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
      <p className="text-gray-600">Welcome, Admin! 🎉 Here’s where you’ll manage destinations, bookings, and analytics.</p>
    </main>
  )
}
