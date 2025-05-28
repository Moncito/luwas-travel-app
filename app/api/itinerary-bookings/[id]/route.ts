// app/api/itinerary-bookings/[id]/route.ts

import { db } from "@/firebase/admin"
import { NextResponse } from "next/server"

// ✏️ Update itinerary booking
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id
  try {
    const body = await req.json()

    await db.collection("itineraryBookings").doc(id).update({
      name: body.name,
      email: body.email,
      date: body.date,
      people: Number(body.people),
      status: body.status,
    })

    return NextResponse.json({ message: "Updated successfully" })
  } catch (err) {
    console.error("🔥 Error updating itinerary booking:", err)
    return new NextResponse("Failed to update booking", { status: 500 })
  }
}

// 🗑️ Delete itinerary booking
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id
  try {
    await db.collection("itineraryBookings").doc(id).delete()
    return new NextResponse("Booking deleted", { status: 200 })
  } catch (err) {
    console.error("🔥 Error deleting itinerary booking:", err)
    return new NextResponse("Failed to delete booking", { status: 500 })
  }
}
