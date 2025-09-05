export const dynamic = "force-dynamic";

import { fetchAdminMetrics } from "@/lib/admin/fetchMetrics";
import BookingAnalyticsChart from "@/components/(admin)/BookingAnalyticsChart";
import RecentBookingsPanel from "@/components/(admin)/RecentBookingsPanel";
import ItineraryBookingChart from "@/components/(admin)/ItineraryBookingChart";
import TopPerformers from "@/components/(admin)/TopPerformers";
import WeatherSummaryCards from "@/components/(admin)/WeatherSummaryCards";
import WeatherAnalyticsChart from "@/components/(admin)/WeatherAnalyticsChart";
import UserTripCharts from "@/components/(admin)/UserTripCharts";

import { Users, MapPin, ClipboardList } from "lucide-react";

export default async function AdminDashboardPage() {
  const { totalUsers, totalTrips, totalItineraries } = await fetchAdminMetrics();
  const greeting = getGreeting();

  return (
    <div className="p-8 space-y-10 bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen">
      {/* Greeting */}
      <header>
        <h1 className="text-3xl font-bold text-gray-800">
          {greeting}, Admin 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Here’s your dashboard summary today.
        </p>
      </header>

      {/* Metrics Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="Total Users"
          value={totalUsers}
          icon={<Users className="w-6 h-6 text-blue-600" />}
        />
        <DashboardCard
          title="Total Trips"
          value={totalTrips}
          icon={<MapPin className="w-6 h-6 text-green-600" />}
        />
        <DashboardCard
          title="Total Itineraries"
          value={totalItineraries}
          icon={<ClipboardList className="w-6 h-6 text-purple-600" />}
        />
      </section>

      {/* Trends Overview */}
      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Trends Overview
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UserTripCharts />
          <BookingAnalyticsChart />
          <ItineraryBookingChart />
          <WeatherAnalyticsChart />
        </div>
      </section>

      {/* Insights */}
      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Insights</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopPerformers />
          <WeatherSummaryCards />
        </div>
      </section>

      {/* Recent Bookings */}
      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
        </h2>
        <RecentBookingsPanel />
      </section>
    </div>
  );
}

/* ------------------ Reusable Metric Card ------------------ */
function DashboardCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 p-6 rounded-xl bg-white shadow-sm border hover:shadow-md transition">
      <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gray-100">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

/* ------------------ Greeting Helper ------------------ */
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  if (hour < 22) return "Good evening";
  return "Working late?";
}
