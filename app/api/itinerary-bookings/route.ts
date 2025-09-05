import { db } from "@/firebase/admin";
import { NextResponse } from "next/server";
import { fetchWeather } from "@/lib/weather";

interface ItineraryData {
  title: string;
  latitude: number;
  longitude: number;
  slug?: string;
  price?: number;
}

// ✅ Fetch all itinerary bookings
export async function GET() {
  try {
    const snapshot = await db.collection("itineraryBookings").orderBy("createdAt", "desc").get();
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json(bookings);
  } catch (error) {
    console.error("❌ Error fetching itinerary bookings:", error);
    return NextResponse.json({ error: "Failed to fetch itinerary bookings" }, { status: 500 });
  }
}

// ✅ Create itinerary booking
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, itineraryId, date, status, people, totalPrice, phone, userId, paymentMethod, address } = body;

    if (!itineraryId || !date || !name || !email) {
      return new NextResponse(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    const itinDoc = await db.collection("itineraries").doc(itineraryId).get();
    if (!itinDoc.exists) return new NextResponse(JSON.stringify({ error: "Itinerary not found" }), { status: 404 });

    const itinData = itinDoc.data() as ItineraryData | undefined;
    if (!itinData?.latitude || !itinData?.longitude) {
      return new NextResponse(JSON.stringify({ error: "Itinerary missing lat/lon" }), { status: 400 });
    }

    // ✅ Fetch weather
    const weather = await fetchWeather(itinData.latitude, itinData.longitude, date);

    const newBooking = {
      name,
      email,
      phone,
      address,
      userId,
      itineraryId,
      slug: itinData.slug ?? "",
      title: itinData.title ?? "Untitled Itinerary",
      date,
      paid: true,
      paidAt: new Date(),
      paymentMethod,
      status: status || "upcoming",
      people: people || 1,
      totalPrice: Number(totalPrice) || 0,
      createdAt: new Date(),
      latitude: itinData.latitude,
      longitude: itinData.longitude,
      weather,
    };

    const docRef = await db.collection("itineraryBookings").add(newBooking);
    return NextResponse.json({ id: docRef.id, ...newBooking });
  } catch (error) {
    console.error("❌ Error creating itinerary booking:", error);
    return new NextResponse("Failed to create itinerary booking", { status: 500 });
  }
}
