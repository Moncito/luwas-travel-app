import { db } from "@/firebase/admin";
import { NextResponse } from "next/server";

interface Params {
  params: { id: string };
}

export async function GET(_: Request, { params }: Params) {
  try {
    const doc = await db.collection("promos").doc(params.id).get();
    if (!doc.exists) return new NextResponse("Promo not found", { status: 404 });
    return NextResponse.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error("❌ Error fetching promo:", err);
    return new NextResponse("Failed to fetch promo", { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const body = await req.json();
    const updated = { ...body, updatedAt: new Date() };

    await db.collection("promos").doc(params.id).update(updated);
    return NextResponse.json({ id: params.id, ...updated });
  } catch (err) {
    console.error("❌ Error updating promo:", err);
    return new NextResponse("Failed to update promo", { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    await db.collection("promos").doc(params.id).delete();
    return new NextResponse("Promo deleted", { status: 200 });
  } catch (err) {
    console.error("❌ Error deleting promo:", err);
    return new NextResponse("Failed to delete promo", { status: 500 });
  }
}
