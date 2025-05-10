"use server";

import { db } from "@/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

type DailyAnalytics = {
  date: string;
  users: number;
  trips: number;
};

const formatDate = (timestamp: Timestamp) =>
  timestamp.toDate().toISOString().split("T")[0];

const getCountByDate = (docs: FirebaseFirestore.QueryDocumentSnapshot[], field: string) => {
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

    const userCounts = getCountByDate(usersSnapshot.docs, "createdAt");
    const tripCounts = getCountByDate(tripsSnapshot.docs, "createdAt");

    const allDates = Array.from(new Set([...Object.keys(userCounts), ...Object.keys(tripCounts)])).sort();

    return allDates.map((date) => ({
      date,
      users: userCounts[date] || 0,
      trips: tripCounts[date] || 0,
    }));
  } catch (error) {
    console.error(error);
    throw error;
  }
}
