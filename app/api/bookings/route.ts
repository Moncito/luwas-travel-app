import { db } from "@/firebase/admin";
import { fetchWeather } from "@/lib/weather";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

interface DestinationData {
  name: string;
  latitude: number;
  longitude: number;
  location?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
}

// ✅ Fetch all bookings
export async function GET() {
  try {
    const snapshot = await db.collection("bookings").orderBy("createdAt", "desc").get();
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json(bookings);
  } catch (error) {
    console.error("❌ Error fetching bookings:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

// ✅ Create a new booking
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { destinationId, departureDate, fullName, email, travelers } = body;

    if (!destinationId || !departureDate || !fullName || !email) {
      return NextResponse.json({ error: "Missing required booking fields" }, { status: 400 });
    }

    // Fetch destination
    const destDoc = await db.collection("destinations").doc(destinationId).get();
    if (!destDoc.exists) return NextResponse.json({ error: "Destination not found" }, { status: 404 });

    const destData = destDoc.data() as DestinationData | undefined;
    if (!destData?.latitude || !destData?.longitude) {
      return NextResponse.json({ error: "Destination missing lat/lon" }, { status: 400 });
    }

    // Fetch weather for departure date
    const weather = await fetchWeather(destData.latitude, destData.longitude, departureDate);

    const newBooking = {
      fullName,
      email,
      destination: destData.name ?? "Unknown Destination",
      latitude: destData.latitude,
      longitude: destData.longitude,
      departureDate,
      travelers: travelers ?? 1,
      status: "upcoming", // default status
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      weather,
    };

    const docRef = await db.collection("bookings").add(newBooking);
    return NextResponse.json({ id: docRef.id, ...newBooking }, { status: 201 });
  } catch (err) {
    console.error("❌ Error creating booking:", err);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
