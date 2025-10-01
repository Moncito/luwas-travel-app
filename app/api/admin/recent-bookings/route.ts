// app/api/admin/recent-bookings/route.ts
import { db } from '@/firebase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // fetch the latest docs from all 3 collections
    const [tripSnap, itinSnap, promoSnap] = await Promise.all([
      db.collection('bookings').orderBy('createdAt', 'desc').limit(5).get(),
      db.collection('itineraryBookings').orderBy('createdAt', 'desc').limit(5).get(),
      db.collection('promoBookings').orderBy('createdAt', 'desc').limit(5).get(),
    ])

    const normalize = (
      docs: FirebaseFirestore.QuerySnapshot,
      type: 'trip' | 'itinerary' | 'promo'
    ) =>
      docs.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          fullName: data.fullName || data.name || '[unknown]',
          destination:
            data.destination || data.title || data.promoTitle || '[no destination]',
          status: data.status || 'upcoming',
          createdAt:
            data.createdAt?.toDate?.() ||
            (data.createdAt?.seconds ? new Date(data.createdAt.seconds * 1000) : new Date()),
          type,
        }
      })

    const trips = normalize(tripSnap, 'trip')
    const itins = normalize(itinSnap, 'itinerary')
    const promos = normalize(promoSnap, 'promo')

    // combine & sort by most recent
    const combined = [...trips, ...itins, ...promos]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10) // latest 10 across all

    return NextResponse.json(combined)
  } catch (err) {
    console.error('🔥 Failed to fetch recent bookings:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
