import { signOut } from "@/lib/actions/auth.action";
import { NextResponse } from "next/server";

export async function POST() {
await signOut();
return NextResponse.json({ success: true });
}
