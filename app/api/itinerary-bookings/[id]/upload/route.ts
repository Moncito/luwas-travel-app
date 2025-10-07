// app/api/bookings/[id]/upload/route.ts
import { db } from "@/firebase/admin";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");

    // Upload to Imgur
    const res = await fetch("https://api.imgur.com/3/image", {
      method: "POST",
      headers: {
        Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
      },
      body: new URLSearchParams({ image: base64 }),
    });

    const data = await res.json();
    if (!data.success) throw new Error("Upload failed");

    const proofUrl = data.data.link;

    // Update Firestore
    await db.collection("itineraryBookings").doc(params.id).update({
      proofUrl,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true, proofUrl });
  } catch (error) {
    console.error("🔥 Upload failed:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
