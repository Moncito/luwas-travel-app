'use client';

import dynamic from 'next/dynamic';

const UserTripChart = dynamic(() => import('@/components/(admin)/UserTripCharts'), { ssr: false });

export default function UserTripChartSection() {
  return (
    <section className="bg-white p-6 rounded-xl shadow border mt-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Analytics Overview</h2>
      <UserTripChart />
    </section>
  );
}
