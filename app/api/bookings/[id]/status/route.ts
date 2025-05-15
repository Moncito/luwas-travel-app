// app/api/bookings/[id]/status/route.ts
import { db } from '@/firebase/admin'
import { NextResponse } from 'next/server'

export async function PATCH(
  req: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params

  try {
    const { status } = await req.json()

    if (!['upcoming', 'completed', 'cancelled', 'paid', 'waiting_payment'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    await db.collection('bookings').doc(id).update({ status })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating booking status:', error)
    return NextResponse.json({ error: 'Unauthorized or failed' }, { status: 403 })
  }
}
