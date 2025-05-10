import { fetchAdminMetrics } from "@/lib/admin/fetchMetrics";
import UserTripChartSection from "@/components/(admin)/UserTripChartSection"; // ✅ new import
import BookingAnalyticsChart from "@/components/(admin)/BookingAnalyticsChart";

export default async function AdminDashboardPage() {
  const { totalUsers, totalTrips, pendingApprovals } = await fetchAdminMetrics();

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
        <DashboardCard title="Pending Approvals" value={pendingApprovals} color="orange" />
      </section>

      <UserTripChartSection /> 

      <BookingAnalyticsChart/>
    </div>
  );
}

// Reusable Card Component
function DashboardCard({ title, value, color }: { title: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    orange: "bg-orange-100 text-orange-800",
  };

  return (
    <div className={`p-6 rounded-xl shadow-sm border ${colorMap[color]}`}>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}

// Get Greeting based on time
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  if (hour < 22) return "Good evening";
  return "Working late?";
}
