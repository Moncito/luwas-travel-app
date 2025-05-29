export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/firebase/admin";
import { fetchAdminMetrics } from "@/lib/admin/fetchMetrics";
import BookingAnalyticsChart from "@/components/(admin)/BookingAnalyticsChart";
import RecentBookingsPanel from '@/components/(admin)/RecentBookingsPanel';
import ItineraryBookingChart from "@/components/(admin)/ItineraryBookingChart";
import TopPerformers from "@/components/(admin)/TopPerformers";
import WeatherSummaryCards from "@/components/(admin)/WeatherSummaryCards";
import WeatherAnalyticsChart from "@/components/(admin)/WeatherAnalyticsChart";
import UserTripCharts from "@/components/(admin)/UserTripCharts";

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("__session")?.value;

  if (!token) {
    return redirect("/admin/log-in");
  }

  try {
    const decoded = await auth.verifySessionCookie(token, true);
    if (!decoded.admin) {
      return redirect("/admin/log-in");
    }
  } catch (err) {
    console.error("❌ Invalid session:", err);
    return redirect("/admin/log-in");
  }

  const { totalUsers, totalTrips, totalItineraries } = await fetchAdminMetrics();
  const greeting = getGreeting();

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen">
      <header>
        <h1 className="text-3xl font-bold text-gray-800">{greeting}, Admin 👋</h1>
        <p className="text-gray-600 mt-1">Here’s your dashboard summary today.</p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard title="Total Users" value={totalUsers} color="blue" />
        <DashboardCard title="Total Trips" value={totalTrips} color="green" />
        <DashboardCard title="Total Itineraries" value={totalItineraries} color="purple" />
      </section>

      <TopPerformers />
      <WeatherSummaryCards />
      <RecentBookingsPanel />
      <WeatherAnalyticsChart />
      <UserTripCharts />
      <BookingAnalyticsChart />
      <ItineraryBookingChart />
    </div>
  );
}

// Reusable Card Component
function DashboardCard({ title, value, color }: { title: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    orange: "bg-orange-100 text-orange-800",
    purple: "bg-purple-100 text-purple-800",
  };

  const iconMap: Record<string, string> = {
    "Total Users": "👤",
    "Total Trips": "🧳",
    "Total Itineraries": "📌",
  };

  return (
    <div
      className={`p-6 rounded-xl shadow-sm border transition duration-300 hover:shadow-md ${colorMap[color]}`}
    >
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <span>{iconMap[title]}</span> {title}
      </h2>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  if (hour < 22) return "Good evening";
  return "Working late?";
}
