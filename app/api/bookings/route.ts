import { db } from "@/firebase/admin";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { fetchWeather } from "@/lib/weather";

interface DestinationData {
  name: string;
  latitude: number;
  longitude: number;
  location?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
}

// ✅ Handle GET requests
export async function GET() {
  try {
    const snapshot = await db.collection("bookings").orderBy("createdAt", "desc").get();

    const bookings = snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate
          ? data.createdAt.toDate().toISOString()
          : null,
        updatedAt: data.updatedAt?.toDate
          ? data.updatedAt.toDate().toISOString()
          : null,
      };
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("❌ Error fetching bookings:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

// ✅ Handle POST requests
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { destinationId, departureDate, fullName, email, travelers } = body;

    if (!destinationId || !departureDate || !fullName || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const destDoc = await db.collection("destinations").doc(destinationId).get();
    if (!destDoc.exists)
      return NextResponse.json({ error: "Destination not found" }, { status: 404 });

    const destData = destDoc.data() as DestinationData;

    const weather = await fetchWeather(destData.latitude, destData.longitude, departureDate);

    const newBooking = {
      fullName,
      email,
      destination: destData.name,
      departureDate,
      travelers,
      latitude: destData.latitude,
      longitude: destData.longitude,
      status: "upcoming",
      weather,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection("bookings").add(newBooking);

    return NextResponse.json({ id: docRef.id, ...newBooking }, { status: 201 });
  } catch (error) {
    console.error("❌ Error creating booking:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
