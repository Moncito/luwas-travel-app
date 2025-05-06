import { NextResponse } from "next/server";
import { getTrips } from "@/lib/actions/firebaseTrips";

export async function GET() {
  try {
    const trips = await getTrips();
    return NextResponse.json(trips);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch trips." }, { status: 500 });
  }
}
