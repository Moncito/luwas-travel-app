'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  Title,
  Decimation,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  Title,
  Decimation
);

interface Trend {
  month: string;
  destinationsAvgTemp: number | null;
  itinerariesAvgTemp: number | null;
  promosAvgTemp: number | null;   // ✅ New
  bookingCount: number;
  itineraryCount: number;
  promoCount: number;             // ✅ New
  topCondition: string;
}

const emojiForCondition = (condition: string) => {
  if (/sun/i.test(condition)) return '☀️';
  if (/rain|shower/i.test(condition)) return '🌧️';
  if (/cloud/i.test(condition)) return '⛅';
  if (/storm|thunder/i.test(condition)) return '⛈️';
  return '🌥️';
};

export default function WeatherTrendsAnalyticsChart() {
  const [data, setData] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState('All');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/analytics/weather', { cache: 'no-store' });
        if (!res.ok) throw new Error(`Status: ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error(e);
        setError('Failed to load weather analytics.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const months = useMemo(
    () => Array.from(new Set(data.map((d) => d.month))),
    [data]
  );

  const filtered = useMemo(
    () => (selectedMonth === 'All' ? data : data.filter((d) => d.month === selectedMonth)),
    [data, selectedMonth]
  );

  const labels = useMemo(() => filtered.map((d) => d.month), [filtered]);

  // ✅ Only Line chart (Temps for Destinations, Itineraries, Promos)
  const chartData = useMemo(() => {
    return {
      labels,
      datasets: [
        {
          label: 'Destinations Avg Temp (°C)',
          data: filtered.map((d) => d.destinationsAvgTemp ?? null),
          yAxisID: 'y',
          borderColor: 'rgba(59, 130, 246, 1)', // blue
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
          borderWidth: 3,
          tension: 0.35,
          fill: true,
          pointRadius: 4,
        },
        {
          label: 'Itineraries Avg Temp (°C)',
          data: filtered.map((d) => d.itinerariesAvgTemp ?? null),
          yAxisID: 'y',
          borderColor: 'rgba(234, 179, 8, 1)', // yellow
          backgroundColor: 'rgba(234, 179, 8, 0.15)',
          borderWidth: 3,
          tension: 0.35,
          fill: true,
          pointRadius: 4,
        },
        {
          label: 'Promos Avg Temp (°C)',
          data: filtered.map((d) => d.promosAvgTemp ?? null),
          yAxisID: 'y',
          borderColor: 'rgba(239, 68, 68, 1)', // red
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          borderWidth: 3,
          tension: 0.35,
          fill: true,
          pointRadius: 4,
        },
      ],
    };
  }, [filtered, labels]);

  const options: ChartOptions<'line'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'top',
        labels: { usePointStyle: true, boxWidth: 10 },
      },
      tooltip: {
        callbacks: {
          afterBody: (items) => {
            const idx = items?.[0]?.dataIndex ?? 0;
            const row = filtered[idx];
            if (!row) return '';
            return ` ${emojiForCondition(row.topCondition)} ${row.topCondition}`;
          },
        },
      },
    },
    scales: {
      y: {
        type: 'linear',
        position: 'left',
        title: { display: true, text: 'Avg Temp (°C)' },
        ticks: { stepSize: 2 },
        grid: { color: '#e5e7eb' },
      },
    },
  }), [filtered]);

  const insight = useMemo(() => filtered[0] ?? null, [filtered]);

  if (loading) return <p className="text-center text-gray-600 mt-10">Loading weather chart...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

  const totalBookings = filtered.reduce(
    (sum, d) => sum + d.bookingCount + d.itineraryCount + d.promoCount,
    0
  );

  const avgDestTemp =
    filtered.reduce((sum, d) => sum + (d.destinationsAvgTemp ?? 0), 0) /
    (filtered.length || 1);
  const avgItinTemp =
    filtered.reduce((sum, d) => sum + (d.itinerariesAvgTemp ?? 0), 0) /
    (filtered.length || 1);
  const avgPromoTemp =
    filtered.reduce((sum, d) => sum + (d.promosAvgTemp ?? 0), 0) /
    (filtered.length || 1);

  return (
    <div className="mt-10 p-8 rounded-xl bg-gradient-to-br from-blue-50 via-white to-yellow-50 shadow-lg">
      {/* Header + Filter */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-900">🌤️ Weather & Booking Trends</h2>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border border-blue-300 text-blue-900 px-3 py-1 rounded-lg shadow-sm focus:outline-none"
        >
          <option value="All">All Months</option>
          {months.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
      </div>

      {/* Descriptive Summary */}
      <div className="bg-white border border-blue-100 rounded-md px-4 py-2 mb-4 shadow-sm text-sm text-gray-700">
        {selectedMonth !== 'All' && insight ? (
          <p>
            In{' '}
            <span className="font-semibold text-blue-700">{insight.month}</span>, 
            destinations averaged{' '}
            <span className="font-bold">{insight.destinationsAvgTemp ?? 'N/A'}°C</span>, itineraries{' '}
            <span className="font-bold">{insight.itinerariesAvgTemp ?? 'N/A'}°C</span>, and promos{' '}
            <span className="font-bold">{insight.promosAvgTemp ?? 'N/A'}°C</span>. <br />
            There were{' '}
            <span className="font-bold">{insight.bookingCount}</span> destination bookings,{' '}
            <span className="font-bold">{insight.itineraryCount}</span> itinerary bookings, and{' '}
            <span className="font-bold">{insight.promoCount}</span> promo bookings. <br />
            Most common condition: {emojiForCondition(insight.topCondition)}{' '}
            <span className="font-semibold">{insight.topCondition}</span>.
          </p>
        ) : (
          <p>
            This chart displays combined weather and booking trends across all months.
            Use the filter above to explore monthly averages and conditions.
          </p>
        )}
      </div>

      {/* Line Chart Only */}
      <div className="w-full h-[350px] bg-white rounded-lg p-4 shadow">
        <Line data={chartData} options={options} />
      </div>

      {/* Stats Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-700">
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <p className="font-semibold text-gray-600">Total Bookings</p>
          <p className="text-2xl font-bold text-emerald-600">{totalBookings}</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <p className="font-semibold text-gray-600">Avg Destination Temp</p>
          <p className="text-xl font-bold text-blue-600">{avgDestTemp.toFixed(1)}°C</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <p className="font-semibold text-gray-600">Avg Itinerary Temp</p>
          <p className="text-xl font-bold text-yellow-600">{avgItinTemp.toFixed(1)}°C</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <p className="font-semibold text-gray-600">Avg Promo Temp</p>
          <p className="text-xl font-bold text-red-600">{avgPromoTemp.toFixed(1)}°C</p>
        </div>
      </div>
    </div>
  );
}
