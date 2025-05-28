// app/api/admin/bookings/export/route.ts
import { db } from '@/firebase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const tripSnap = await db.collection('bookings').get()
    const itinSnap = await db.collection('itineraryBookings').get()

    const tripResults = tripSnap.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        fullName: data.fullName,
        destination: data.destination,
        status: data.status || 'upcoming',
        createdAt: data.createdAt?.toDate?.().toISOString() || '',
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
        createdAt: data.createdAt?.toDate?.().toISOString() || '',
        type: 'itinerary',
      }
    })

    const combined = [...tripResults, ...itinResults]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const headers = ['ID', 'Full Name', 'Destination', 'Status', 'Created At', 'Type']
    const rows = combined.map(b =>
      [b.id, b.fullName, b.destination, b.status, b.createdAt, b.type].join(',')
    )

    const csv = [headers.join(','), ...rows].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="bookings_export_${Date.now()}.csv"`,
      },
    })
  } catch (err) {
    console.error('🔥 Failed to export bookings:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
