// components/(admin)/BookingCard.tsx
'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import type { Booking } from '../types';

export default function BookingCard({ booking }: { booking: Booking }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = confirm("Are you sure you want to delete this booking?");
    if (!confirmed) return;

    try {
      setDeleting(true);
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      toast.success('Booking deleted!');
      window.location.reload();
    } catch (err) {
      console.error('Error deleting booking:', err);
      toast.error('Error deleting booking.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 space-y-2 border">
      <h2 className="font-bold text-lg">{booking.fullName}</h2>
      <p className="text-sm text-gray-600">Destination: {booking.destination}</p>
      <p className="text-sm text-gray-600">Departure: {booking.departureDate}</p>
      <p className="text-sm text-gray-600">Status: {booking.status}</p>

      <button
        onClick={handleDelete}
        disabled={deleting}
        className="text-red-600 text-sm hover:underline"
      >
        {deleting ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
}