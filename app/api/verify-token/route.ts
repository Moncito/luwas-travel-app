// app/api/verify-token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/firebase/admin';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    const decodedClaims = await auth.verifySessionCookie(token, true);
    return NextResponse.json({ valid: true });
  } catch (error) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }
}