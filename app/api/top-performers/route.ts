import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin';
import { startOfMonth, subMonths, endOfMonth } from 'date-fns';
import type { Timestamp } from 'firebase-admin/firestore';

type BookingDoc = {
  destinationId?: string;
  createdAt?: Timestamp | { seconds?: number } | string | null;
};

type ItineraryDoc = {
  slug?: string;
  createdAt?: Timestamp | { seconds?: number } | string | null;
  people?: number;
};

// ✅ Handles Firestore Timestamps, seconds, ISO string, null, or undefined
const toDate = (
  ts: string | Timestamp | { seconds?: number; toDate?: () => Date } | null | undefined
): Date => {
  if (!ts) return new Date();
  if (typeof ts === 'string') return new Date(ts);
  if (typeof ts === 'object') {
    if (typeof ts.toDate === 'function') return ts.toDate();
    if ('seconds' in ts && typeof ts.seconds === 'number') return new Date(ts.seconds * 1000);
  }
  return new Date();
};

export async function GET() {
  const now = new Date();
  const currentStart = startOfMonth(now);
  const lastStart = startOfMonth(subMonths(now, 1));
  const lastEnd = endOfMonth(subMonths(now, 1));

  // ---------- DESTINATION BOOKINGS ----------
  const bookingsSnapshot = await db.collection('bookings').get();
  const destStats: Record<string, { current: number; prev: number }> = {};

  bookingsSnapshot.forEach((doc) => {
    const { destinationId, createdAt } = doc.data() as BookingDoc;
    const date = toDate(createdAt);
    if (!destinationId || !date) return;

    if (!destStats[destinationId]) destStats[destinationId] = { current: 0, prev: 0 };

    if (date >= currentStart) destStats[destinationId].current++;
    else if (date >= lastStart && date <= lastEnd) destStats[destinationId].prev++;
  });

  const topDestination = Object.entries(destStats).sort((a, b) => b[1].current - a[1].current)[0];

  let topDestinationInfo = null;
  if (topDestination) {
    const [id, stats] = topDestination;
    const snapshot = await db.collection('destinations').doc(id).get();
    const data = snapshot.data();
    const growth = stats.prev ? Math.round(((stats.current - stats.prev) / stats.prev) * 100) : 0;

topDestinationInfo = {
  name: data?.name || id,             // ← change back to `name`
  imageUrl: data?.imageUrl || '',     // ← change back to `imageUrl`
  count: stats.current,
  growth,
};

  }

  // ---------- ITINERARY BOOKINGS ----------
  const itinerarySnapshot = await db.collection('itineraryBookings').get();
  const itineraryStats: Record<string, { current: number; prev: number }> = {};

  itinerarySnapshot.forEach((doc) => {
    const { slug, createdAt, people } = doc.data() as ItineraryDoc;
    const date = toDate(createdAt);
    const count = people || 1;
    if (!slug || !date) return;

    if (!itineraryStats[slug]) itineraryStats[slug] = { current: 0, prev: 0 };

    if (date >= currentStart) itineraryStats[slug].current += count;
    else if (date >= lastStart && date <= lastEnd) itineraryStats[slug].prev += count;
  });

  const topItinerary = Object.entries(itineraryStats).sort((a, b) => b[1].current - a[1].current)[0];

  let topItineraryInfo = null;
  if (topItinerary) {
    const [slug, stats] = topItinerary;
    const querySnapshot = await db.collection('itineraries').where('slug', '==', slug).limit(1).get();
    const data = querySnapshot.docs[0]?.data();
    const growth = stats.prev ? Math.round(((stats.current - stats.prev) / stats.prev) * 100) : 0;

    topItineraryInfo = {
      name: data?.title || slug,
      imageUrl: data?.image || '',
      travelers: stats.current,
      growth,
    };
  }

  return NextResponse.json({
    topDestination: topDestinationInfo,
    topItinerary: topItineraryInfo,
  });
}
