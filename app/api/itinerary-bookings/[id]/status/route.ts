import { db } from "@/firebase/admin";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await req.json();
    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    await db.collection("promoBookings").doc(params.id).update({
      status,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("🔥 Failed to update promo status:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
