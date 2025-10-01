// app/api/itinerary-bookings/route.ts
import { db } from "@/firebase/admin";
import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";

export async function GET() {
  try {
    const snapshot = await db.collection("itineraryBookings").orderBy("createdAt", "desc").get();

    const bookings = snapshot.docs.map(doc => {
      const data = doc.data();

      let createdAt: string | null = null;
      if (data.createdAt instanceof Timestamp) {
        createdAt = data.createdAt.toDate().toISOString();
      } else if (typeof data.createdAt === "number") {
        createdAt = new Date(data.createdAt).toISOString();
      } else if (data.createdAt instanceof Date) {
        createdAt = data.createdAt.toISOString();
      } else if (typeof data.createdAt === "string") {
        createdAt = new Date(data.createdAt).toISOString();
      }

      return {
        id: doc.id,
        ...data,
        createdAt, // always normalized ISO string
      };
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("❌ Error fetching itinerary bookings:", error);
    return NextResponse.json({ error: "Failed to fetch itinerary bookings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, itineraryId, date, status, people, totalPrice, phone, userId, paymentMethod, address } = body;

    if (!itineraryId || !date || !name || !email) {
      return new NextResponse(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    const itinDoc = await db.collection("itineraries").doc(itineraryId).get();
    if (!itinDoc.exists) return new NextResponse(JSON.stringify({ error: "Itinerary not found" }), { status: 404 });

    const itinData = itinDoc.data();

    const newBooking = {
      name,
      email,
      phone,
      address,
      userId,
      itineraryId,
      slug: itinData?.slug ?? "",
      title: itinData?.title ?? "Untitled Itinerary",
      date,
      paid: false,
      paidAt: null,
      paymentMethod: paymentMethod ?? "pending",
      status: status || "pending",
      people: people || 1,
      totalPrice: Number(totalPrice) || 0,
      createdAt: Timestamp.now(), // ✅ fixed
    };

    const docRef = await db.collection("itineraryBookings").add(newBooking);
    return NextResponse.json({ id: docRef.id, ...newBooking });
  } catch (error) {
    console.error("❌ Error creating itinerary booking:", error);
    return new NextResponse("Failed to create itinerary booking", { status: 500 });
  }
}
