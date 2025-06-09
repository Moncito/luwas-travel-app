import { db } from '@/firebase/admin';
import { NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { fetchWeatherForecast } from '@/lib/weather'; // ✅ Real forecast helper

// ==========================
// 🔁 GET: Fetch all bookings
// ==========================
export async function GET() {
  try {
    const snapshot = await db
      .collection('bookings')
      .orderBy('createdAt', 'desc')
      .get();

    const bookings = snapshot.docs.map((doc) => {
      const data = doc.data();

      const createdAt =
        data.createdAt instanceof Timestamp
          ? data.createdAt.toDate()
          : new Date();

      return {
        id: doc.id,
        fullName: data.fullName || '',
        email: data.email || '',
        phone: data.phone || '',
        destination: data.destination || '',
        destinationId: data.destinationId || '',
        departureDate: data.departureDate || '',
        status: data.status || 'upcoming',
        proofUrl: data.proofUrl || null,
        totalPrice: Number(data.totalPrice) || 0,
        createdAt,
        weather: {
          avgTemp: data.weather?.avgTemp ?? null,
          condition: data.weather?.condition ?? null,
        },
      };
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('🔥 Error fetching bookings:', error);
    return new NextResponse('Failed to fetch bookings', { status: 500 });
  }
}

// ===========================
// ➕ POST: Create new booking
// ===========================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      fullName,
      email,
      phone,
      destination,
      departureDate,
      status,
      proofUrl,
      destinationId,
    } = body;

    // 🌤️ Fetch weather forecast based on destination + travel date
    const weather = await fetchWeatherForecast(destination, departureDate);

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
      weather,
    };

    const docRef = await db.collection('bookings').add(newBooking);

    return NextResponse.json({ id: docRef.id, ...newBooking });
  } catch (error) {
    console.error('❌ Error creating booking:', error);
    return new NextResponse('Failed to create booking', { status: 500 });
  }
}
