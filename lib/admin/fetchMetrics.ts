// lib/admin/fetchMetrics.ts
import { db } from "@/firebase/admin";

export async function fetchAdminMetrics() {
  const usersSnapshot = await db.collection("users").get();
  const bookingsSnapshot = await db.collection("bookings").get();
  const itinerariesSnapshot = await db.collection("itineraries").get();

  const totalUsers = usersSnapshot.size;
  const totalTrips = bookingsSnapshot.size;
  const totalItineraries = itinerariesSnapshot.size;

  return {
    totalUsers,
    totalTrips,
    totalItineraries,
  };
}
