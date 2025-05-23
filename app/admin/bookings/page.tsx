"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { Booking } from "@/types/booking";
import EditBookingModal from "@/components/(admin)/EditBookingModal";
import BookingAnalyticsChart from "@/components/(admin)/BookingAnalyticsChart";
import BookingDetailsModal from "@/components/(admin)/BookingDetailsModal";
import EditItineraryBookingModal from "@/components/(admin)/EditItineraryBookingModal";

type BookingStatus = 'upcoming' | 'completed' | 'cancelled' | 'paid' | 'waiting_payment';

const allowedStatuses = ['upcoming', 'completed', 'cancelled', 'paid', 'waiting_payment'] as const;

function safeStatus(status: string): BookingStatus {
  return allowedStatuses.includes(status as any)
    ? (status as BookingStatus)
    : 'upcoming';
}

const statusColor: Record<BookingStatus, string> = {
  upcoming: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-600',
  paid: 'bg-emerald-100 text-emerald-700',
  waiting_payment: 'bg-yellow-100 text-yellow-700',
};

interface ItineraryBooking {
  id: string;
  name: string;
  email: string;
  date: string;
  people: number;
  slug?: string;
  status?: BookingStatus;
  createdAt?: { seconds: number };
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [itineraryBookings, setItineraryBookings] = useState<ItineraryBooking[]>([]);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editingItinerary, setEditingItinerary] = useState<ItineraryBooking | null>(null);

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setBookings(
        data.map((booking: any) => ({
          ...booking,
          status: safeStatus(booking.status),
        }))
      );
    } catch (err: any) {
      console.error("Error fetching bookings:", err);
      setError(err.message);
      toast.error("Failed to fetch bookings.");
    } finally {
      setLoading(false);
    }
  };

  const fetchItineraryBookings = async () => {
    try {
      const res = await fetch("/api/itinerary-bookings");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setItineraryBookings(data);
    } catch (err) {
      console.error("Error fetching itinerary bookings:", err);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchItineraryBookings();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;

    try {
      const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      setBookings(bookings.filter((booking) => booking.id !== id));
      toast.success("Booking deleted!");
    } catch (err) {
      console.error("Error deleting booking:", err);
      toast.error("Error deleting booking.");
    }
  };

  const handleDeleteItineraryBooking = async (id: string) => {
    if (!confirm("Delete this itinerary booking?")) return;

    try {
      const res = await fetch(`/api/itinerary-bookings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      setItineraryBookings(prev => prev.filter(b => b.id !== id));
      toast.success("Itinerary booking deleted.");
    } catch (err) {
      console.error("Error deleting itinerary booking:", err);
      toast.error("Error deleting itinerary booking.");
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === 'all') return true;
    return booking.status.toLowerCase() === filter;
  });

  const handleExportToCSV = (): void => {
    const headers = ['Full Name', 'Destination', 'Departure Date', 'Status', 'Created At'];
    const rows = filteredBookings.map((b) => [
      b.fullName,
      b.destination,
      b.departureDate,
      b.status,
      format(new Date(b.createdAt), 'yyyy-MM-dd'),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers, ...rows]
        .map((e) => e.map((v) => `"${v}"`).join(','))
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bookings_${filter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <p className="text-center text-gray-500">Loading Bookings...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    // Your JSX code...
    <div className="p-8 space-y-10">
      <h1 className="text-2xl font-bold text-blue-900">All Bookings</h1>

      {/* Rest of your JSX code... */}

      <div className="bg-white rounded-lg shadow-md p-6 overflow-x-auto">
        <table className="min-w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-2">Full Name</th>
              <th className="text-left px-4 py-2">Destination</th>
              <th className="text-left px-4 py-2">Departure</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-left px-4 py-2">Created</th>
              <th className="text-left px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking) => (
              <tr key={booking.id} className="border-t">
                <td className="px-4 py-2">{booking.fullName}</td>
                <td className="px-4 py-2">{booking.destination}</td>
                <td className="px-4 py-2">{booking.departureDate}</td>
                <td className="px-4 py-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[booking.status as BookingStatus]}`}>
                    {booking.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-2">{format(new Date(booking.createdAt), "yyyy-MM-dd")}</td>
                <td className="px-4 py-2 space-x-2">
                  <button className="text-blue-600 hover:underline" onClick={() => setSelectedBooking(booking)}>View</button>
                  <button className="text-blue-600 hover:underline" onClick={() => setEditingBooking(booking)}>Edit</button>
                  <button className="text-red-600 hover:underline" onClick={() => handleDelete(booking.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Itinerary Bookings */}
      <h2 className="text-xl font-bold mt-12 mb-4 text-blue-800">🗓️ Itinerary Bookings</h2>
      <div className="bg-white rounded-lg shadow-md p-6 overflow-x-auto">
        <table className="min-w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-2">Name</th>
              <th className="text-left px-4 py-2">Email</th>
              <th className="text-left px-4 py-2">Travel Date</th>
              <th className="text-left px-4 py-2">People</th>
              <th className="text-left px-4 py-2">Itinerary</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-left px-4 py-2">Created</th>
              <th className="text-left px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {itineraryBookings.map((booking) => (
              <tr key={booking.id} className="border-t">
                <td className="px-4 py-2">{booking.name}</td>
                <td className="px-4 py-2">{booking.email}</td>
                <td className="px-4 py-2">{booking.date}</td>
                <td className="px-4 py-2">{booking.people}</td>
                <td className="px-4 py-2 capitalize">{booking.slug?.replace(/-/g, " ")}</td>
                <td className="px-4 py-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[booking.status as BookingStatus] || 'bg-gray-100 text-gray-800'}`}>
                    {booking.status?.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  {booking.createdAt?.seconds
                    ? new Date(booking.createdAt.seconds * 1000).toLocaleDateString()
                    : "-"}
                </td>
                <td className="px-4 py-2 space-x-2">
                  <button className="text-blue-600 hover:underline" onClick={() => setEditingItinerary(booking)}>Edit</button>
                  <button className="text-red-600 hover:underline" onClick={() => handleDeleteItineraryBooking(booking.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {editingBooking && (
        <EditBookingModal
          booking={editingBooking}
          onClose={() => setEditingBooking(null)}
          onUpdated={() => {
            setEditingBooking(null);
            fetchBookings();
          }}
        />
      )}

      {selectedBooking && (
        <BookingDetailsModal
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          booking={selectedBooking}
          onStatusChange={(id, newStatus) => {
            setBookings(prev =>
              prev.map(b =>
                b.id === id ? { ...b, status: safeStatus(newStatus) } : b
              )
            );
          }}
        />
      )}

      {editingItinerary && (
        <EditItineraryBookingModal
          booking={editingItinerary}
          onClose={() => setEditingItinerary(null)}
          onUpdated={() => {
            setEditingItinerary(null);
            fetchItineraryBookings();
          }}
        />
      )}
    </div>
  );
}