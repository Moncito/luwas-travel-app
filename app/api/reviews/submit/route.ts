import { db } from '@/firebase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { name, rating, comment, destinationId } = await req.json()

  if (!name || !rating || !comment || !destinationId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  await db.collection('reviews').add({
    name,
    rating,
    comment,
    destinationId,
    createdAt: new Date().toISOString(),
  })

  return NextResponse.json({ success: true })
}
