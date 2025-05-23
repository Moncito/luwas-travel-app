"use client";

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/client";
import { toast } from "sonner";

interface Props {
  booking: {
    id: string;
    name: string;
    email: string;
    date: string;
    people: number;
    slug: string;
    status?: string;
  };
  onClose: () => void;
  onUpdated: () => void;
}

const statuses = ["upcoming", "paid", "completed", "cancelled", "waiting_payment"];

export default function EditItineraryBookingModal({ booking, onClose, onUpdated }: Props) {
  const [form, setForm] = useState({
    name: booking.name || "",
    email: booking.email || "",
    date: booking.date || "",
    people: booking.people || 1,
    status: booking.status || "upcoming",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === "people" ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateDoc(doc(db, "itineraryBookings", booking.id), {
        ...form,
        people: Number(form.people),
      });
      toast.success("✅ Itinerary booking updated!");
      onUpdated();
    } catch (err) {
      toast.error("❌ Failed to update itinerary booking.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-blue-800">Edit Itinerary Booking</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full border p-2 rounded"
            required
          />
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full border p-2 rounded"
            required
          />
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
          <input
            name="people"
            type="number"
            min="1"
            value={form.people}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status.replace("_", " ")}
              </option>
            ))}
          </select>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded bg-blue-700 text-white hover:bg-blue-800"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
