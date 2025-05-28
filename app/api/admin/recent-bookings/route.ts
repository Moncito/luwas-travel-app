// app/api/admin/recent-bookings/route.ts
import { db } from '@/firebase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const tripSnap = await db
      .collection('bookings')
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get()

    const itinSnap = await db
      .collection('itineraryBookings')
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get()

    const tripResults = tripSnap.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        fullName: data.fullName,
        destination: data.destination,
        status: data.status || 'upcoming',
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
        type: 'trip',
      }
    })

    const itinResults = itinSnap.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        fullName: data.fullName || data.name || '[unknown]',
        destination: data.destination || data.title || '[itinerary]',
        status: data.status || 'upcoming',
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
        type: 'itinerary',
      }
    })

    const combined = [...tripResults, ...itinResults]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5)

    return NextResponse.json(combined)
  } catch (err) {
    console.error('🔥 Failed to fetch recent bookings:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
