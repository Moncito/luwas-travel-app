// app/api/bookings/route.ts
import { db } from '@/firebase/admin';
import { NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET() {
  try {
    const snapshot = await db.collection('bookings').orderBy('createdAt', 'desc').get();

    const bookings = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        fullName: data.fullName || '',
        email: data.email || '',
        phone: data.phone || '',
        destination: data.destination || '',
        departureDate: data.departureDate || '',
        createdAt: (data.createdAt instanceof Timestamp)
          ? data.createdAt.toDate().toISOString()
          : new Date().toISOString(),
        status: data.status || 'upcoming',
        proofUrl: data.proofUrl || null,
      };
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return new NextResponse('Failed to fetch bookings', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, email, phone, destination, departureDate, status, proofUrl, destinationId } = body;

    const newBooking = {
      fullName,
      email,
      phone,
      destination,
      departureDate,
      createdAt: new Date(),
      status: status || 'pending',
      destinationId,
      proofUrl: proofUrl || null,
    };

    const docRef = await db.collection('bookings').add(newBooking);

    return NextResponse.json({ id: docRef.id, ...newBooking });
  } catch (error) {
    console.error('Error creating booking:', error);
    return new NextResponse('Failed to create booking', { status: 500 });
  }
}
