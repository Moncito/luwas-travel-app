// app/api/bookings/[id]/route.ts
import { db } from '@/firebase/admin'
import { NextResponse } from 'next/server'

export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params

  try {
    await db.collection('bookings').doc(id).delete()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 })
  }
}
