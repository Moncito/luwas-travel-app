"use client";

const stats = [
  {
    title: "Total Users",
    value: 342,
    description: "New users this week: 24",
  },
  {
    title: "Total Trips",
    value: 128,
    description: "4 new trips added",
  },
  {
    title: "Bookings Today",
    value: 31,
    description: "12% increase from yesterday",
  },
  {
    title: "Revenue",
    value: "₱28,540",
    description: "This month",
  },
];

export default function DashboardCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8 pt-5">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="bg-white rounded-xl shadow p-6 border hover:shadow-md transition-all"
        >
          <h3 className="text-gray-500 text-sm">{stat.title}</h3>
          <p className="text-2xl font-bold text-blue-700 mt-2">{stat.value}</p>
          <p className="text-xs text-gray-400 mt-1">{stat.description}</p>
        </div>
      ))}
    </div>
  );
}
