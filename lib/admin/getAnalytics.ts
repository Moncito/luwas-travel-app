"use server";

import { db } from "@/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

type DailyAnalytics = {
  date: string;
  users: number;
  trips: number; // now includes itineraries + destinations
};

const formatDate = (timestamp: Timestamp) =>
  timestamp.toDate().toISOString().split("T")[0];

const getCountByDate = (
  docs: FirebaseFirestore.QueryDocumentSnapshot[],
  field: string
) => {
  const counts: Record<string, number> = {};
  docs.forEach((doc) => {
    const data = doc.data();
    if (data[field] instanceof Timestamp) {
      const date = formatDate(data[field]);
      counts[date] = (counts[date] || 0) + 1;
    }
  });
  return counts;
};

export async function getDailyAnalytics(): Promise<DailyAnalytics[]> {
  try {
    const usersSnapshot = await db.collection("users").get();
    const tripsSnapshot = await db.collection("destinations").get();
    const itinSnapshot = await db.collection("itineraryBookings").get();

    const userCounts = getCountByDate(usersSnapshot.docs, "createdAt");
    const tripCounts = getCountByDate(tripsSnapshot.docs, "createdAt");
    const itinCounts = getCountByDate(itinSnapshot.docs, "createdAt");

    // 🧠 Merge trip + itinerary bookings by date
    const allTripDates = new Set([...Object.keys(tripCounts), ...Object.keys(itinCounts)]);
    const combinedTripCounts: Record<string, number> = {};

    allTripDates.forEach((date) => {
      combinedTripCounts[date] = (tripCounts[date] || 0) + (itinCounts[date] || 0);
    });

    // ✅ Merge all dates across users and all types of trips
    const allDates = Array.from(new Set([
      ...Object.keys(userCounts),
      ...Object.keys(combinedTripCounts),
    ])).sort();

    return allDates.map((date) => ({
      date,
      users: userCounts[date] || 0,
      trips: combinedTripCounts[date] || 0,
    }));
  } catch (error) {
    console.error("🔥 Failed to generate analytics:", error);
    throw error;
  }
}
