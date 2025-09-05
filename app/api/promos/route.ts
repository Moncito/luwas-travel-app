import { db } from "@/firebase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const snapshot = await db.collection("promos").orderBy("createdAt", "desc").get();
    const promos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(promos);
  } catch (err) {
    console.error("❌ Error fetching promos:", err);
    return new NextResponse("Failed to fetch promos", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, discountPercentage, startDate, endDate, location, price, imageUrl, latitude, longitude } = body;

    if (!title || !price || !discountPercentage) {
      return new NextResponse(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    const finalPrice = price - (price * (discountPercentage / 100));

    const newPromo = {
      title,
      description,
      discountPercentage,
      startDate,
      endDate,
      location,
      price,
      finalPrice,
      imageUrl,
      latitude,
      longitude,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await db.collection("promos").add(newPromo);
    return NextResponse.json({ id: docRef.id, ...newPromo });
  } catch (err) {
    console.error("❌ Error creating promo:", err);
    return new NextResponse("Failed to create promo", { status: 500 });
  }
}
