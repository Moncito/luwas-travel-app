'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { Booking } from '@/types/booking';
import type { ItineraryBooking } from '@/types/itineraryBooking';
import type { EmailPayload, DestinationBooking } from '@/lib/mail';
import { sendReceiptEmail } from '@/lib/mail';

import DestinationBookingsTable from '@/components/(admin)/DestinationBookingsTable';
import ItineraryBookingsTable from '@/components/(admin)/ItineraryBookingsTable';
import ConfirmActionModal from '@/components/(admin)/ConfirmActionModal';

type BookingStatus =
  | 'upcoming'
  | 'completed'
  | 'cancelled'
  | 'paid'
  | 'waiting_payment';

const allowedStatuses = [
  'upcoming',
  'completed',
  'cancelled',
  'paid',
  'waiting_payment',
] as const;

function safeStatus(status: string): BookingStatus {
  return allowedStatuses.includes(status as BookingStatus)
    ? (status as BookingStatus)
    : 'upcoming';
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [itineraryBookings, setItineraryBookings] = useState<
    ItineraryBooking[]
  >([]);
  const [filter, setFilter] = useState<
    'all' | 'upcoming' | 'completed' | 'cancelled'
  >('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Confirm modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<'delete' | 'send' | null>(
    null
  );
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );
  const [selectedBookingType, setSelectedBookingType] = useState<
    'destination' | 'itinerary' | null
  >(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchBookings();
    fetchItineraryBookings();
  }, []);

const fetchBookings = async () => {
  try {
    const res = await fetch('/api/bookings');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const raw: Booking[] = await res.json();

    const normalized = raw.map((b) => ({
      ...b,
      status: safeStatus(b.status),
      createdAt: normalizeDate(b.createdAt),
    }));

    setBookings(normalized);
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
    const raw: ItineraryBooking[] = await res.json();

    const normalized = raw.map((b) => ({
      ...b,
      createdAt: normalizeDate(b.createdAt),
    }));

    setItineraryBookings(normalized);
  } catch (err) {
    console.error('Error fetching itinerary bookings:', err);
  }
};

// 🔑 Date normalizer
function normalizeDate(date: unknown): Date {
  if (!date) return new Date(0); // fallback to epoch
  if (date instanceof Date) return date;
  if (typeof (date as any)?.toDate === 'function') return (date as any).toDate(); // Firestore Timestamp
  const parsed = new Date(date as string);
  return isNaN(parsed.getTime()) ? new Date(0) : parsed;
}

  const handleSendReceipt = async ({ name, email, type, booking }: EmailPayload) => {
    const toastId = toast.loading('Sending receipt email...');
    try {
      await sendReceiptEmail({ name, email, type, booking });
      toast.success(`📧 Receipt sent to ${email}`, { id: toastId });

      // Mark as paid for destinations
      if (type === 'destination') {
        await fetch(`/api/bookings/${booking.id}/mark-paid`, { method: 'PATCH' });
      }
    } catch (err) {
      console.error('❌ Email send error:', err);
      toast.error('Failed to send receipt', { id: toastId });
    }
  };

  const handleConfirm = async () => {
    if (!selectedBookingId || !confirmType || !selectedBookingType) return;
    setIsProcessing(true);

    try {
      if (confirmType === 'delete') {
        const url =
          selectedBookingType === 'destination'
            ? `/api/bookings/${selectedBookingId}`
            : `/api/itinerary-bookings/${selectedBookingId}`;
        const res = await fetch(url, { method: 'DELETE' });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        if (selectedBookingType === 'destination') {
          setBookings((prev) => prev.filter((b) => b.id !== selectedBookingId));
        } else {
          setItineraryBookings((prev) =>
            prev.filter((b) => b.id !== selectedBookingId)
          );
        }
        toast.success('Booking deleted.');
      }

      if (confirmType === 'send') {
        if (selectedBookingType === 'destination') {
          const booking = bookings.find((b) => b.id === selectedBookingId);
          if (!booking) throw new Error('Booking not found');
          await handleSendReceipt({
            name: booking.fullName,
            email: booking.email,
            type: 'destination',
            booking: {
              id: booking.id,
              amount: booking.totalPrice,
              departureDate: booking.departureDate,
              destinationName: booking.destination,
              type: 'destination',
            } satisfies DestinationBooking,
          });
        } else if (selectedBookingType === 'itinerary') {
          const itinerary = itineraryBookings.find(
            (b) => b.id === selectedBookingId
          );
          if (!itinerary) throw new Error('Itinerary not found');
          await handleSendReceipt({
            name: itinerary.name,
            email: itinerary.email,
            type: 'itinerary',
            booking: {
              id: itinerary.id,
              amount: itinerary.totalPrice,
              departureDate: itinerary.date,
              itineraryTitle:
                itinerary.slug?.replace(/-/g, ' ') ?? 'Untitled',
              type: 'itinerary',
            },
          });
        }
        toast.success('Receipt sent.');
      }
    } catch (err) {
      toast.error('Action failed.');
      console.error(err);
    } finally {
      setIsProcessing(false);
      setConfirmOpen(false);
      setConfirmType(null);
      setSelectedBookingId(null);
      setSelectedBookingType(null);
    }
  };

  const filteredBookings =
    filter === 'all'
      ? bookings
      : bookings.filter((b) => b.status.toLowerCase() === filter);

  if (loading) return <p className="text-center text-gray-500">Loading Bookings...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="p-8 space-y-12 bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md">
        <h1 className="text-3xl font-extrabold text-blue-900">All Bookings</h1>
        <button
          onClick={() => toast.info('CSV Export coming soon')}
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
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filter === status
                ? 'bg-blue-600 text-white shadow'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status === 'all'
              ? 'All'
              : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Destination Bookings */}
      <DestinationBookingsTable
        bookings={filteredBookings}
        onDelete={(id) => {
          setSelectedBookingId(id);
          setSelectedBookingType('destination');
          setConfirmType('delete');
          setConfirmOpen(true);
        }}
        onSendReceipt={(id) => {
          setSelectedBookingId(id);
          setSelectedBookingType('destination');
          setConfirmType('send');
          setConfirmOpen(true);
        }}
        onUpdateStatus={(id, status) =>
        setBookings((prev) =>
          prev.map((b) =>
            b.id === id ? { ...b, status: status as Booking['status'] } : b
          )
        )
}

      />

      {/* Itinerary Bookings */}
      <ItineraryBookingsTable
        bookings={itineraryBookings}
        onDelete={(id) => {
          setSelectedBookingId(id);
          setSelectedBookingType('itinerary');
          setConfirmType('delete');
          setConfirmOpen(true);
        }}
        onSendReceipt={(id) => {
          setSelectedBookingId(id);
          setSelectedBookingType('itinerary');
          setConfirmType('send');
          setConfirmOpen(true);
        }}
        onUpdateStatus={(id, status) =>
        setItineraryBookings((prev) =>
          prev.map((b) =>
            b.id === id ? { ...b, status: status as ItineraryBooking['status'] } : b
          )
        )
  }

      />

      {/* Confirm Modal */}
      <ConfirmActionModal
        isOpen={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setConfirmType(null);
          setSelectedBookingId(null);
          setSelectedBookingType(null);
        }}
        onConfirm={handleConfirm}
        action={confirmType || 'delete'}
        loading={isProcessing}
      />
    </div>
  );
}
