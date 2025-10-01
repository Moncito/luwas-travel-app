import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase/admin";

function normalize(doc: FirebaseFirestore.QueryDocumentSnapshot, type: "trip" | "itinerary" | "promo") {
  const data = doc.data() as any;
  return {
    id: doc.id,
    type,
    // User fields
    fullName: data.fullName || data.name || data.paidBy?.name || "[unknown]",
    email: data.email || data.paidBy?.email || "",
    userId: data.userId || data.paidBy?.uid || null,
    // Booking info
    destination: data.destination || data.title || data.promoTitle || "[none]",
    people: data.travelers || data.people || 1,
    status: data.status || "upcoming",
    createdAt: data.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
    departureDate: data.departureDate || data.date || null,
    totalPrice: data.totalPrice || data.finalPrice || 0,
    // Payment
    paidAt: data.paidAt?.toDate?.().toISOString() || null,
    proofUrl: data.proofUrl || null,
    paidBy: data.paidBy || null,
    // Extras
    specialRequests: data.specialRequests || "",
    location: data.location || "Philippines",
    weather: data.weather || null,
    discountPercentage: data.discountPercentage || null,
    finalPrice: data.finalPrice || null,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Fetch all docs (we filter in JS instead of Firestore OR query)
    const [tripSnap, itinSnap, promoSnap] = await Promise.all([
      db.collection("bookings").get(),
      db.collection("itineraryBookings").get(),
      db.collection("promoBookings").get(),
    ]);

    // Normalize all
    const trips = tripSnap.docs.map((doc) => normalize(doc, "trip"));
    const itineraries = itinSnap.docs.map((doc) => normalize(doc, "itinerary"));
    const promos = promoSnap.docs.map((doc) => normalize(doc, "promo"));

    // Filter by either userId or paidBy.uid
    const combined = [...trips, ...itineraries, ...promos].filter(
      (b) => b.userId === userId
    );

    // Sort newest first
    combined.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(combined, { status: 200 });
  } catch (err) {
    console.error("🔥 travel-history error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
