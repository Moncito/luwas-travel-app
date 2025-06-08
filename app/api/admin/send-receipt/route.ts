import { NextResponse, NextRequest } from 'next/server';
import { sendReceiptEmail } from '@/lib/mail';

export async function POST(req: NextRequest) {
  try {
    const { name, email, type, booking } = await req.json();

    if (!name || !email || !booking) {
      return NextResponse.json({ message: 'Missing data' }, { status: 400 });
    }

    await sendReceiptEmail({
  name,
  email,
  type,
  booking,
});

    return NextResponse.json({ message: 'Receipt sent' });
  } catch (err) {
    console.error('💥 Email error:', err);
    return NextResponse.json({ message: 'Email failed', error: (err as Error).message }, { status: 500 });
  }
}
