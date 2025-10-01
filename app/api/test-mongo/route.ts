import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/mongo";

export async function GET() {
  try {
    await dbConnect();
    return NextResponse.json({ message: "✅ MongoDB connected successfully" });
  } catch (error) {
    return NextResponse.json({ message: "❌ MongoDB connection failed", error });
  }
}
