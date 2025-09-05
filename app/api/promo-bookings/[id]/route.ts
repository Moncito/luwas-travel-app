import { db } from "@/firebase/admin";
import { NextResponse } from "next/server";

interface Params {
  params: { id: string };
}

export async function GET(_: Request, { params }: Params) {
  try {
    const doc = await db.collection("promoBookings").doc(params.id).get();
    if (!doc.exists) return new NextResponse("Promo booking not found", { status: 404 });
    return NextResponse.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error("❌ Error fetching promo booking:", err);
    return new NextResponse("Failed to fetch promo booking", { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const body = await req.json();
    const updated = { ...body, updatedAt: new Date() };

    await db.collection("promoBookings").doc(params.id).update(updated);
    return NextResponse.json({ id: params.id, ...updated });
  } catch (err) {
    console.error("❌ Error updating promo booking:", err);
    return new NextResponse("Failed to update promo booking", { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    await db.collection("promoBookings").doc(params.id).delete();
    return new NextResponse("Promo booking deleted", { status: 200 });
  } catch (err) {
    console.error("❌ Error deleting promo booking:", err);
    return new NextResponse("Failed to delete promo booking", { status: 500 });
  }
}
