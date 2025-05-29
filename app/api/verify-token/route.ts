import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin'; // ✅ Correct import

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    const decoded = await adminAuth.verifySessionCookie(token, true);

    if (!decoded.admin) {
      return NextResponse.json({ valid: false, message: 'Not an admin' }, { status: 403 });
    }

    return NextResponse.json({ valid: true, uid: decoded.uid });
  } catch (err) {
    console.error('❌ Token verification failed:', err);
    return NextResponse.json({ valid: false }, { status: 401 });
  }
}
