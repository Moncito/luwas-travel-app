// app/api/bookings/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin';

export async function GET() {
  try {
    const snapshot = await db.collection('bookings').orderBy('createdAt', 'desc').get();

    const bookings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return new NextResponse('Failed to fetch bookings', { status: 500 });
  }
}
