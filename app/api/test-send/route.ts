import { NextResponse } from 'next/server';
import { sendReceiptEmail } from '@/lib/mail';

export async function GET() {
  try {
    await sendReceiptEmail({
      name: 'Test User',
      email: 'moncitoglenn03@gmail.com', // use your own
      type: 'destination',
      booking: {
        id: 'test-123',
        destinationName: 'Palawan',
        amount: 2999,
        departureDate: '2025-06-15',
      },
    });

    return NextResponse.json({ message: 'Email sent ✅' });
  } catch (err) {
    console.error('❌ SendGrid error:', err);
    return NextResponse.json({ message: 'Failed', error: (err as Error).message }, { status: 500 });
  }
}
