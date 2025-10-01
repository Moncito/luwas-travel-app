import { NextResponse } from "next/server";
import { db } from "@/firebase/admin";

export async function GET() {
  try {
    const trips = await db.collection("bookings").get();
    const itineraries = await db.collection("itineraryBookings").get();
    const promos = await db.collection("promoBookings").get();

    const normalize = (snap: FirebaseFirestore.QuerySnapshot, type: string) =>
      snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          fullName: data.fullName || data.name || "[unknown]",
          email: data.email || "",
          destination: data.destination || data.title || data.promoTitle || "[none]",
          people: data.travelers || data.people || 1,
          status: data.status || "upcoming",
          createdAt: data.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
          type,
          totalPrice: data.totalPrice || data.finalPrice || 0,
          departureDate: data.departureDate || data.date || null,
        };
      });

    const combined = [
      ...normalize(trips, "trip"),
      ...normalize(itineraries, "itinerary"),
      ...normalize(promos, "promo"),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(combined, { status: 200 });
  } catch (err: any) {
    console.error("🔥 Failed to fetch unified bookings:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
