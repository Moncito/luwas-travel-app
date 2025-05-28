import { getCurrentUser } from "@/lib/actions/auth.action";
import { NextResponse } from "next/server";

export async function GET() {
const user = await getCurrentUser();
return NextResponse.json({ user });
}
