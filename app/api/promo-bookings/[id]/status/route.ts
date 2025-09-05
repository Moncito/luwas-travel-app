import { db } from "@/firebase/admin";
import { NextResponse } from "next/server";

interface Params {
  params: { id: string };
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const { status } = await req.json();
    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    await db.collection("promoBookings").doc(params.id).update({
      status,
      updatedAt: new Date(),
    });

    return NextResponse.json({ id: params.id, status });
  } catch (err) {
    console.error("❌ Error updating promo booking status:", err);
    return new NextResponse("Failed to update status", { status: 500 });
  }
}
