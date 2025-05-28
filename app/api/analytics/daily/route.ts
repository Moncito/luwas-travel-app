// app/api/analytics/daily/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

type DailyAnalytics = {
  date: string;
  totalUsers: number;
  totalTrips: number;
};

const formatDate = (timestamp: Timestamp): string =>
  timestamp.toDate().toISOString().split('T')[0];

const countByDate = (docs: FirebaseFirestore.QueryDocumentSnapshot[], field: string) => {
  const result: Record<string, number> = {};
  for (const doc of docs) {
    const data = doc.data();
    const ts = data[field];
    if (ts instanceof Timestamp) {
      const date = formatDate(ts);
      result[date] = (result[date] || 0) + 1;
    }
  }
  return result;
};

export async function GET() {
  try {
    const usersSnap = await db.collection('users').get();
    const tripsSnap = await db.collection('destinations').get();

    const usersByDate = countByDate(usersSnap.docs, 'createdAt');
    const tripsByDate = countByDate(tripsSnap.docs, 'createdAt');

    const allDates = Array.from(new Set([...Object.keys(usersByDate), ...Object.keys(tripsByDate)])).sort();

    const dailyAnalytics: DailyAnalytics[] = allDates.map(date => ({
      date,
      totalUsers: usersByDate[date] || 0,
      totalTrips: tripsByDate[date] || 0,
    }));

    return NextResponse.json(dailyAnalytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
