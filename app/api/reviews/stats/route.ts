import { db } from '@/firebase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const destinationId = req.nextUrl.searchParams.get('destinationId')
  if (!destinationId) {
    return NextResponse.json({ count: 0, average: 0 })
  }

  const snapshot = await db
    .collection('reviews')
    .where('destinationId', '==', destinationId)
    .get()

  const reviews = snapshot.docs.map((doc) => doc.data())
  const count = reviews.length
  const average =
    count > 0
      ? reviews.reduce((sum, r: any) => sum + (r.rating || 0), 0) / count
      : 0

  return NextResponse.json({ count, average })
}
