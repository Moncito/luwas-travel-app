import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/admin';
import {
  sendReceiptEmail,
  BookingType,
  DestinationBooking,
  ItineraryBooking,
} from '@/lib/mail';

const WEBHOOK_SECRET = process.env.PAYMONGO_WEBHOOK_SECRET as string;

function isValidSignature(signature: string | null, body: string): boolean {
  if (!signature) return false;

  const [tPart, sigPart] = signature.split(',').map((s) => s.trim());
  const timestamp = tPart?.split('=')[1];
  const signatureHash = sigPart?.split('=')[1];

  if (!timestamp || !signatureHash) return false;

  const payload = `${timestamp}.${body}`;
  const hmac = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signatureHash));
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const bodyText = await req.text();
  const signature = req.headers.get('Paymongo-Signature');

  if (!isValidSignature(signature, bodyText)) {
    console.error('🚨 Invalid webhook signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  try {
    const json = JSON.parse(bodyText);

    const eventType: string | undefined = json.data?.attributes?.type;
    const billingInfo = json.data?.attributes?.data?.attributes?.billing as {
      name: string;
      email: string;
      reference_number: string;
    };

    if (eventType !== 'payment.paid') {
      console.log('Ignoring non-paid event:', eventType);
      return NextResponse.json({ received: true });
    }

    const [successType, bookingId] = billingInfo.reference_number?.split(':') ?? [];

    if (!successType || !bookingId || !billingInfo.email || !billingInfo.name) {
      console.error('Invalid reference or billing info');
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    let bookingData: DestinationBooking | ItineraryBooking | null = null;

    if (successType === 'destination') {
      const doc = await db.collection('bookings').doc(bookingId).get(); // ✅ corrected here
      if (doc.exists) {
        const data = doc.data();
        bookingData = {
          id: bookingId,
          destinationName: data?.destination ?? 'Unknown Destination',
          amount: data?.totalPrice ?? 0,
          departureDate: data?.departureDate ?? 'TBD',
        };
      }
    } else if (successType === 'itinerary') {
      const doc = await db.collection('itineraryBookings').doc(bookingId).get();
      if (doc.exists) {
        const data = doc.data();
        bookingData = {
          id: bookingId,
          itineraryTitle: data?.itineraryTitle ?? data?.title ?? 'Untitled Itinerary',
          amount: data?.totalPrice ?? 0,
          departureDate: data?.departureDate ?? 'TBD',
        };
      }
    }

    if (!bookingData) {
      console.error('Booking not found in Firestore');
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    await sendReceiptEmail({
      name: billingInfo.name,
      email: billingInfo.email,
      type: successType as BookingType,
      booking: bookingData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[WEBHOOK ERROR]', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
