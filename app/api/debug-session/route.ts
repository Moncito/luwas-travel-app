// app/api/debug-session/route.ts

import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies(); // ✅ your setup needs this
  const sessionCookie = cookieStore.get("__session")?.value;

  if (!sessionCookie) {
    return NextResponse.json({ error: "No __session cookie found" }, { status: 401 });
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return NextResponse.json({ decoded }, { status: 200 });
  } catch (error) {
    console.error("❌ Invalid session cookie:", error);

    return NextResponse.json(
      {
        error: "Session invalid",
        details:
          error instanceof Error ? error.message : "Unknown error",
      },
      { status: 403 }
    );
  }
}
