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

// ✅ Safely convert Firestore timestamp or string
const toDate = (
  ts: string | Timestamp | { seconds?: number; toDate?: () => Date } | null | undefined
): Date => {
  if (!ts) return new Date(0);
  if (typeof ts === 'string') return new Date(ts);
  if (typeof ts === 'object') {
    if (typeof ts.toDate === 'function') return ts.toDate();
    if ('seconds' in ts && typeof ts.seconds === 'number') return new Date(ts.seconds * 1000);
  }
  return new Date(0);
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

    const prev = stats.prev;
    const growth = prev > 0
      ? Math.round(((stats.current - prev) / prev) * 100)
      : stats.current > 0
        ? 100
        : 0;

    topDestinationInfo = {
      name: data?.title || data?.name || id,
      imageUrl: data?.image || data?.imageUrl || '',
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

  // 🧠 Sanitize travelers field
  const travelers = Number(people);
  const safeTravelers =
    !isNaN(travelers) && travelers > 0 && travelers <= 50 ? travelers : 1;

  if (!slug || !date) return;

  if (!itineraryStats[slug]) itineraryStats[slug] = { current: 0, prev: 0 };

  if (date >= currentStart) itineraryStats[slug].current += safeTravelers;
  else if (date >= lastStart && date <= lastEnd) itineraryStats[slug].prev += safeTravelers;
});

const topItinerary = Object.entries(itineraryStats).sort((a, b) => b[1].current - a[1].current)[0];

let topItineraryInfo = null;

if (topItinerary) {
  const [slug, stats] = topItinerary;
  const querySnapshot = await db.collection('itineraries').where('slug', '==', slug).limit(1).get();
  const data = querySnapshot.docs[0]?.data();

  const prev = stats.prev;
  const growth =
    prev > 0
      ? Math.round(((stats.current - prev) / prev) * 100)
      : stats.current > 0
      ? 100
      : 0;

  // 🧠 Cap unrealistic growth values
  const safeGrowth = Math.min(growth, 200);

  topItineraryInfo = {
    name: data?.title || slug,
    imageUrl: data?.image || data?.imageUrl || '',
    travelers: Math.min(stats.current, 1000), // cap display to 1000 travelers
    growth: safeGrowth,
  };
}


  return NextResponse.json({
    topDestination: topDestinationInfo || {
      name: 'No destination data',
      count: 0,
      imageUrl: '',
      growth: 0,
    },
    topItinerary: topItineraryInfo || {
      name: 'No itinerary data',
      travelers: 0,
      imageUrl: '',
      growth: 0,
    },
  });
}
