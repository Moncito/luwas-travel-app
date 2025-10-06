import { db } from "@/firebase/admin";
import { NextResponse } from "next/server";
import { fetchWeather } from "@/lib/weather";

interface PromoData {
  title: string;
  description?: string;
  discountPercentage: number;
  price: number;
  finalPrice: number;
  latitude: number;
  longitude: number;
  startDate?: string;
  endDate?: string;
}

export async function GET() {
  try {
    const snapshot = await db.collection("promoBookings").orderBy("createdAt", "desc").get();

    const bookings = snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        ...data,
        // ✅ Fix Firestore Timestamp → ISO string
        createdAt: data.createdAt?.toDate
          ? data.createdAt.toDate().toISOString()
          : data.createdAt?.seconds
          ? new Date(data.createdAt.seconds * 1000).toISOString()
          : null,
        updatedAt: data.updatedAt?.toDate
          ? data.updatedAt.toDate().toISOString()
          : data.updatedAt?.seconds
          ? new Date(data.updatedAt.seconds * 1000).toISOString()
          : null,
      };
    });

    return NextResponse.json(bookings);
  } catch (err) {
    console.error("❌ Error fetching promo bookings:", err);
    return new NextResponse("Failed to fetch promo bookings", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { promoId, fullName, email, phone, travelers, departureDate, userId, paymentMethod, status } = body;

    if (!promoId || !fullName || !email || !departureDate) {
      return new NextResponse(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    // 🔎 Fetch the promo doc
    const promoDoc = await db.collection("promos").doc(promoId).get();
    if (!promoDoc.exists) return new NextResponse(JSON.stringify({ error: "Promo not found" }), { status: 404 });

    const promoData = promoDoc.data() as PromoData;
    if (!promoData?.latitude || !promoData?.longitude) {
      return new NextResponse(JSON.stringify({ error: "Promo missing lat/lon" }), { status: 400 });
    }

    // ✅ Fetch weather for the promo location + date
    const weather = await fetchWeather(promoData.latitude, promoData.longitude, departureDate);

    const totalPrice = promoData.price * (travelers ?? 1);
    const discountApplied = totalPrice * (promoData.discountPercentage / 100);
    const finalPrice = totalPrice - discountApplied;

    const newBooking = {
      promoId,
      userId,
      fullName,
      email,
      phone,
      travelers: travelers ?? 1,
      departureDate,
      paymentMethod: paymentMethod ?? "unpaid",
      status: status || "upcoming",
      createdAt: new Date(),
      updatedAt: new Date(),
      promoTitle: promoData.title,
      discountApplied,
      totalPrice,
      finalPrice,
      weather,
    };

    const docRef = await db.collection("promoBookings").add(newBooking);
    return NextResponse.json({ id: docRef.id, ...newBooking });
  } catch (err) {
    console.error("❌ Error creating promo booking:", err);
    return new NextResponse("Failed to create promo booking", { status: 500 });
  }
}
