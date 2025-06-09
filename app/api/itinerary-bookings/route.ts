import { db } from "@/firebase/admin";
import { NextResponse } from "next/server";
import { fetchWeatherForecast } from "@/lib/weather"; // 🧠 helper for real weather

export async function GET() {
  try {
    const snapshot = await db
      .collection("itineraryBookings")
      .orderBy("createdAt", "desc")
      .get();

    const bookings = snapshot.docs.map((doc) => {
      const data = doc.data();

      let createdAt: Date;
      if (data.createdAt?.toDate) {
        createdAt = data.createdAt.toDate(); // Firestore Timestamp
      } else if (data.createdAt?.seconds) {
        createdAt = new Date(data.createdAt.seconds * 1000);
      } else {
        createdAt = new Date(); // fallback
      }

      return {
        id: doc.id,
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        slug: data.slug || '',
        title: data.title || '',
        itineraryId: data.itineraryId || '',
        userId: data.userId || '',
        paymentMethod: data.paymentMethod || '',
        paid: data.paid || false,
        paidAt: data.paidAt || null,
        date: data.date || '',
        status: data.status || "upcoming",
        people: data.people || 1,
        totalPrice: Number(data.totalPrice) || 0,
        createdAt,
        weather: {
          avgTemp: data.weather?.avgTemp ?? null,
          condition: data.weather?.condition ?? null,
        },
      };
    });

    return NextResponse.json(bookings);
  } catch (err) {
    console.error("🔥 Error loading itinerary bookings", err);
    return new NextResponse("Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      slug,
      title, // 🧭 this should be the real place name, e.g., "Palawan"
      date,
      status,
      people,
      totalPrice,
      phone,
      userId,
      itineraryId,
      paymentMethod,
      address,
    } = body;

    const weather = await fetchWeatherForecast(title, date); // ✅ Use real forecast

    const newBooking = {
      name,
      email,
      slug,
      title,
      date,
      phone,
      userId,
      itineraryId,
      address,
      paid: true,
      paidAt: new Date(),
      paymentMethod,
      status: status || "upcoming",
      people: people || 1,
      totalPrice: Number(totalPrice) || 0,
      createdAt: new Date(),
      weather, // 🌤️ attach the forecast
    };

    const docRef = await db.collection("itineraryBookings").add(newBooking);

    return NextResponse.json({ id: docRef.id, ...newBooking });
  } catch (error) {
    console.error("❌ Error creating itinerary booking:", error);
    return new NextResponse("Failed to create itinerary booking", { status: 500 });
  }
}
