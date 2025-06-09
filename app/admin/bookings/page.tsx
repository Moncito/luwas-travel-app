'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';

import type { Booking } from '@/types/booking';
import type { EmailPayload, DestinationBooking} from '@/lib/mail';
import type { ItineraryBooking } from '@/types/itineraryBooking';
import EditBookingModal from '@/components/(admin)/EditBookingModal';
import BookingDetailsModal from '@/components/(admin)/BookingDetailsModal';
import EditItineraryBookingModal from '@/components/(admin)/EditItineraryBookingModal';
import ConfirmActionModal from "@/components/(admin)/ConfirmActionModal";

import { Eye, Pencil, Trash, Mail } from "lucide-react";



import { sendReceiptEmail } from '@/lib/mail';

type BookingStatus = 'upcoming' | 'completed' | 'cancelled' | 'paid' | 'waiting_payment';
const allowedStatuses = ['upcoming', 'completed', 'cancelled', 'paid', 'waiting_payment'] as const;

function safeStatus(status: string): BookingStatus {
  return allowedStatuses.includes(status as BookingStatus) ? (status as BookingStatus) : 'upcoming';
}

const statusColor: Record<BookingStatus, string> = {
  upcoming: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-600',
  paid: 'bg-emerald-100 text-emerald-700',
  waiting_payment: 'bg-yellow-100 text-yellow-700',
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [itineraryBookings, setItineraryBookings] = useState<ItineraryBooking[]>([]);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editingItinerary, setEditingItinerary] = useState<ItineraryBooking | null>(null);
  const [selectedItinerary, setSelectedItinerary] = useState<ItineraryBooking | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<"delete" | "send" | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [selectedBookingType, setSelectedBookingType] = useState<"destination" | "itinerary" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);




  useEffect(() => {
    fetchBookings();
    fetchItineraryBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data: Booking[] = await res.json();
      setBookings(data.map((b) => ({ ...b, status: safeStatus(b.status) })));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast.error('Failed to fetch bookings.');
    } finally {
      setLoading(false);
    }
  };

  const fetchItineraryBookings = async () => {
    try {
      const res = await fetch('/api/itinerary-bookings');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data: ItineraryBooking[] = await res.json();
      setItineraryBookings(data);
    } catch (err) {
      console.error('Error fetching itinerary bookings:', err);
    }
  };

    const handleSendReceipt = async ({ name, email, type, booking }: EmailPayload) => {
      const toastId = toast.loading('Sending receipt email...');

      console.log('📤 Sending Receipt with booking payload:', booking); //  Log full booking object

      try {
        await sendReceiptEmail({ name, email, type, booking });
        toast.success(`📧 Receipt sent to ${email}`, { id: toastId });

        await fetch(`/api/bookings/${booking.id}/mark-paid`, { method: 'PATCH' });
      } catch (err) {
        console.error('❌ Email send error:', err);
        toast.error('Failed to send receipt', { id: toastId });
      }
    };

// 
const handleConfirm = async () => {
  if (!selectedBookingId || !confirmType || !selectedBookingType) return;

  setIsProcessing(true);

  try {
    if (confirmType === "delete") {
      const url =
        selectedBookingType === "destination"
          ? `/api/bookings/${selectedBookingId}`
          : `/api/itinerary-bookings/${selectedBookingId}`;

      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      if (selectedBookingType === "destination") {
        setBookings((prev) => prev.filter((b) => b.id !== selectedBookingId));
      } else {
        setItineraryBookings((prev) => prev.filter((b) => b.id !== selectedBookingId));
      }

      toast.success("Booking deleted.");
    }

    if (confirmType === "send") {
      if (selectedBookingType === "destination") {
        const booking = bookings.find((b) => b.id === selectedBookingId);
        if (!booking) throw new Error("Booking not found");

        await handleSendReceipt({
          name: booking.fullName,
          email: booking.email,
          type: "destination",
          booking: {
            id: booking.id,
            amount: booking.totalPrice,
            departureDate: booking.departureDate,
            destinationName: booking.destination,
            type: "destination",
          } satisfies DestinationBooking,
        });
      } else if (selectedBookingType === "itinerary") {
        const itinerary = itineraryBookings.find((b) => b.id === selectedBookingId);
        if (!itinerary) throw new Error("Itinerary booking not found");

        await handleSendReceipt({
          name: itinerary.name,
          email: itinerary.email,
          type: "itinerary",
          booking: {
            id: itinerary.id,
            amount: itinerary.totalPrice,
            departureDate: itinerary.date,
            itineraryTitle: itinerary.slug?.replace(/-/g, " ") ?? "Untitled",
            type: "itinerary",
          },
        });
      }

      toast.success("Receipt sent.");
    }
  } catch (err) {
    toast.error("Action failed.");
    console.error(err);
  } finally {
    setIsProcessing(false);
    setConfirmOpen(false);
    setConfirmType(null);
    setSelectedBookingId(null);
    setSelectedBookingType(null);
  }
};

// 


  const handleExportToCSV = async () => {
    try {
      const res = await fetch('/api/admin/bookings/export');
      if (!res.ok) throw new Error('Failed to fetch CSV data');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bookings_export_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('❌ CSV export failed:', err);
      toast.error('Failed to export CSV');
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === 'all') return true;
    return booking.status.toLowerCase() === filter;
  });

  if (loading) return <p className="text-center text-gray-500">Loading Bookings...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

// ...

return (
  <div className="p-8 space-y-12 bg-gray-50">
    {/* Header */}
    <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md">
      <h1 className="text-3xl font-extrabold text-blue-900">All Bookings</h1>
      <button
        onClick={handleExportToCSV}
        className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg shadow"
      >
        Export CSV
      </button>
    </div>

    {/* Filter Buttons */}
    <div className="flex flex-wrap gap-3 bg-white p-4 rounded-lg shadow-md">
      {(['all', 'upcoming', 'completed', 'cancelled'] as const).map((status) => (
        <button
          key={status}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            filter === status
              ? 'bg-blue-600 text-white shadow'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setFilter(status)}
        >
          {status === 'all' && 'All'}
          {status === 'upcoming' && 'Upcoming'}
          {status === 'completed' && 'Completed'}
          {status === 'cancelled' && 'Cancelled'}
        </button>
      ))}
    </div>

{/* Destination Bookings */}
<section className="bg-white p-4 rounded-lg shadow-md">
  <h2 className="text-xl font-semibold text-blue-800 mb-4">Destination Bookings</h2>
  <div className="overflow-x-auto">
    <table className="min-w-full text-sm">
      <thead className="bg-gray-100 text-left">
        <tr>
          <th className="px-6 py-3">Name</th>
          <th className="px-6 py-3">Email</th>
          <th className="px-6 py-3">Departure</th>
          <th className="px-6 py-3">People</th>
          <th className="px-6 py-3">Status</th>
          <th className="px-6 py-3">Created</th>
          <th className="px-6 py-3">Actions</th>
        </tr>
      </thead>
      <tbody>
        {filteredBookings.map((booking) => (
          <tr key={booking.id} className="border-t hover:bg-gray-50 transition">
            <td className="px-6 py-3">{booking.fullName}</td>
            <td className="px-6 py-3">{booking.email}</td>
            <td className="px-6 py-3">{booking.departureDate}</td>
            <td className="px-6 py-3">{booking.travelers ?? 1}</td>
            <td className="px-6 py-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[booking.status]}`}>
                {booking.status.replace('_', ' ')}
              </span>
            </td>
            <td className="px-6 py-3">{format(new Date(booking.createdAt), 'MMM dd, yyyy')}</td>
            <td className="px-6 py-3">
              <div className="flex gap-3 items-center">
              <button
                title="View"
                className="text-blue-600 hover:text-blue-800 cursor-pointer"
                onClick={() => setSelectedBooking(booking)}
              >
                <Eye className="w-5 h-5" />
              </button>

              <button
                title="Edit"
                className="text-yellow-600 hover:text-yellow-800 cursor-pointer"
                onClick={() => setEditingBooking(booking)}
              >
                <Pencil className="w-5 h-5" />
              </button>

              <button
                title="Delete"
                className="text-red-600 hover:text-red-800 cursor-pointer"
                onClick={() => {
                  setSelectedBookingId(booking.id);
                  setSelectedBookingType("destination"); // ✅ required for conditional logic
                  setConfirmType("delete");
                  setConfirmOpen(true);
                }}
              >
                <Trash className="w-5 h-5" />
              </button>

            <button
                title="Send Receipt"
                className="text-green-600 hover:text-green-800 cursor-pointer"
                onClick={() => {
                  setSelectedBookingId(booking.id);
                  setSelectedBookingType("destination"); // ✅
                  setConfirmType("send");
                  setConfirmOpen(true);
                }}
              >
                <Mail className="w-5 h-5" />
              </button>
            </div>

            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</section>

{/* Itinerary Bookings */}
<section className="bg-white p-4 rounded-lg shadow-md mt-10">
  <h2 className="text-xl font-semibold text-blue-800 mb-4">Itinerary Bookings</h2>
  <div className="overflow-x-auto">
    <table className="min-w-full text-sm">
      <thead className="bg-gray-100 text-left">
        <tr>
          <th className="px-6 py-3">Name</th>
          <th className="px-6 py-3">Email</th>
          <th className="px-6 py-3">Departure</th>
          <th className="px-6 py-3">People</th>
          <th className="px-6 py-3">Status</th>
          <th className="px-6 py-3">Created</th>
          <th className="px-6 py-3">Actions</th>
        </tr>
      </thead>
      <tbody>
        {itineraryBookings.map((booking) => (
          <tr key={booking.id} className="border-t hover:bg-gray-50 transition">
            <td className="px-6 py-3">{booking.name}</td>
            <td className="px-6 py-3">{booking.email}</td>
            <td className="px-6 py-3">{booking.date}</td>
            <td className="px-6 py-3">{booking.people}</td>
            <td className="px-6 py-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[booking.status ?? 'upcoming']}`}>
                {booking.status?.replace('_', ' ') ?? 'upcoming'}
              </span>
            </td>
            <td className="px-6 py-3">{format(new Date(booking.createdAt), 'MMM dd, yyyy')}</td>
            <td className="px-6 py-3">
              <div className="flex gap-3 items-center">
              <button
                title="View"
                className="text-blue-600 hover:text-blue-800 cursor-pointer"
                onClick={() => setSelectedItinerary(booking)}
              >
                <Eye className="w-5 h-5" />
              </button>

              <button
                title="Edit"
                className="text-yellow-600 hover:text-yellow-800 cursor-pointer"
                onClick={() => setEditingItinerary(booking)}
              >
                <Pencil className="w-5 h-5" />
              </button>

              <button
                title="Delete"
                className="text-red-600 hover:text-red-800 cursor-pointer"
                onClick={() => {
                  setSelectedBookingId(booking.id);
                  setSelectedBookingType("itinerary"); // ✅ required for logic
                  setConfirmType("delete");
                  setConfirmOpen(true);
                }}
              >
                <Trash className="w-5 h-5" />
              </button>

              <button
              title="Send Receipt"
              className="text-green-600 hover:text-green-800 cursor-pointer"
              onClick={() => {
                setSelectedBookingId(booking.id);
                setSelectedBookingType("itinerary"); // ✅
                setConfirmType("send");
                setConfirmOpen(true);
              }}
            >
              <Mail className="w-5 h-5" />
            </button>

            </div>

            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</section>


    {/* Modals */}
    {editingBooking && (
      <EditBookingModal
        booking={editingBooking}
        onClose={() => setEditingBooking(null)}
        onUpdated={fetchBookings}
      />
    )}

{selectedBooking && (
  <BookingDetailsModal
    isOpen={!!selectedBooking}
    onClose={() => setSelectedBooking(null)}
    booking={{
      id: selectedBooking.id,
      fullName: selectedBooking.fullName,
      email: selectedBooking.email,
      phone: selectedBooking.phone ?? '',
      destination: selectedBooking.destination,
      departureDate: selectedBooking.departureDate,
      status: selectedBooking.status,
      proofUrl: selectedBooking.proofUrl,
    }}
    onStatusChange={(id, newStatus) =>
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: safeStatus(newStatus) } : b))
      )
    }
  />
)}

{selectedItinerary && (
  <BookingDetailsModal
    isOpen={!!selectedItinerary}
    onClose={() => setSelectedItinerary(null)}
    booking={{
      id: selectedItinerary.id,
      fullName: selectedItinerary.name,
      email: selectedItinerary.email,
      phone: selectedItinerary.phone ?? '',
      destination: selectedItinerary.slug?.replace(/-/g, ' ') ?? 'Untitled',
      departureDate: selectedItinerary.date,
      status: selectedItinerary.status ?? 'upcoming',
      proofUrl: selectedItinerary.proofUrl,
    }}
    onStatusChange={(id, newStatus) =>
      setItineraryBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: safeStatus(newStatus) } : b))
      )
    }
  />
)}


{editingItinerary && (
  <EditItineraryBookingModal
    booking={editingItinerary}
    onClose={() => setEditingItinerary(null)}
    onUpdated={fetchItineraryBookings}
  />
)}


<ConfirmActionModal
  isOpen={confirmOpen}
  onClose={() => {
    setConfirmOpen(false);
    setConfirmType(null);
    setSelectedBookingId(null);
    setSelectedBookingType(null);
  }}
  onConfirm={handleConfirm}
  action={confirmType || "delete"}
  loading={isProcessing}
/>

  </div>
);
}
