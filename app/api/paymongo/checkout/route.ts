import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const PAYMONGO_SECRET = process.env.PAYMONGO_SECRET_KEY!;

export async function POST(req: NextRequest) {
  const {
    amount,
    name,
    email,
    bookingId,
    destinationId,
    itinerarySlug,
    successType,
  }: {
    amount: number;
    name: string;
    email: string;
    bookingId: string;
    destinationId?: string;
    itinerarySlug?: string;
    successType: 'destination' | 'itinerary';
  } = await req.json();

  const baseUrl =
    process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_SITE_URL || 'https://luwas-travel.vercel.app'
      : 'http://localhost:3000';

  const successPath =
    successType === 'itinerary'
      ? `/itinerary-bookings/success?bookingId=${bookingId}&itinerary=${itinerarySlug}`
      : `/bookings/success?bookingId=${bookingId}&destinationId=${destinationId}`;

  const payload = {
    data: {
      attributes: {
        amount: amount * 100, // Convert to centavos
        redirect: {
          success: `${baseUrl}${successPath}`,
          failed: `${baseUrl}/bookings/failed`,
        },
        billing: {
          name,
          email,
        },
        type: 'gcash', // Can be 'card' if you add that later
        currency: 'PHP',
      },
    },
  };

  try {
    const response = await axios.post(
      'https://api.paymongo.com/v1/sources',
      payload,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(PAYMONGO_SECRET).toString('base64')}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const checkoutUrl = response.data.data.attributes.redirect.checkout_url;
    return NextResponse.json({ url: checkoutUrl });
  } catch (error: unknown) {
    type AxiosErrorShape = {
      response?: {
        data?: unknown;
      };
    };

    if (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      typeof (error as AxiosErrorShape).response === 'object'
    ) {
      const err = error as AxiosErrorShape;
      console.error('[PAYMONGO ERROR]', err.response?.data);
    } else {
      console.error('[PAYMONGO ERROR]', error);
    }

    return NextResponse.json({ error: 'Failed to create payment link.' }, { status: 500 });
  }
}
