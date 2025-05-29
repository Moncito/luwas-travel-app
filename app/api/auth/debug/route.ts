// /app/api/auth/debug/route.ts
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get("__session")?.value;

  if (!token) return new Response("No token", { status: 401 });

  try {
    const decoded = await adminAuth.verifySessionCookie(token, true);
    return Response.json({ uid: decoded.uid, admin: decoded.admin });
  } catch {
    return new Response("Invalid token", { status: 403 });
  }
}
