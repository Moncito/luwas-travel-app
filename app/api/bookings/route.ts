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

// ✅ Create a new booking (fixed)
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      userId,
      destinationId,
      fullName,
      email,
      phone,
      localAddress,
      departureDate,
      returnDate,
      travelers,
      specialRequests,
      totalPrice, // ✅ include from form
      status,
    } = body;

    if (!destinationId || !departureDate || !fullName || !email) {
      return NextResponse.json(
        { error: "Missing required booking fields" },
        { status: 400 }
      );
    }

    // ✅ Fetch destination
    const destDoc = await db.collection("destinations").doc(destinationId).get();
    if (!destDoc.exists)
      return NextResponse.json({ error: "Destination not found" }, { status: 404 });

    const destData = destDoc.data() as DestinationData;
    if (!destData?.latitude || !destData?.longitude) {
      return NextResponse.json(
        { error: "Destination missing lat/lon" },
        { status: 400 }
      );
    }

    // ✅ Fetch weather data
    const weather = await fetchWeather(
      destData.latitude,
      destData.longitude,
      departureDate
    );

    // ✅ Construct booking object with price and extras
    const newBooking = {
      userId: userId || null,
      fullName,
      email,
      phone: phone || "",
      localAddress: localAddress || "",
      destination: destData.name ?? "Unknown Destination",
      latitude: destData.latitude,
      longitude: destData.longitude,
      departureDate,
      returnDate: returnDate || null,
      travelers: travelers ?? 1,
      specialRequests: specialRequests || "",
      totalPrice: totalPrice ?? 0, // ✅ now saved
      status: status || "pending_payment",
      weather,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    // ✅ Save to Firestore
    const docRef = await db.collection("bookings").add(newBooking);

    return NextResponse.json({ id: docRef.id, ...newBooking }, { status: 201 });
  } catch (err) {
    console.error("❌ Error creating booking:", err);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
