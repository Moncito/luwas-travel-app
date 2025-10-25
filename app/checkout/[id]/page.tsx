// File: app/checkout/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/firebase/client";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Image from "next/image";
import { toast } from "sonner";

interface Booking {
  id: string;
  destination: string;
  fullName: string;
  email: string;
  departureDate: string;
  travelers: number;
  totalPrice: number;
  imageUrl?: string;
  status: string;
}

export default function CheckoutPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const snap = await getDoc(doc(db, "bookings", id));
        if (!snap.exists()) {
          toast.error("Booking not found");
          router.push("/destinations");
          return;
        }
        setBooking({ id: snap.id, ...(snap.data() as any) });
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch booking details");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id, router]);

  const handleConfirmPayment = async () => {
    if (!booking) return;
    try {
      setConfirming(true);
      await updateDoc(doc(db, "bookings", booking.id), {
        status: "paid",
        updatedAt: new Date(),
      });
      toast.success("✅ Payment confirmed! Thank you.");
      router.push("/checkout/success");
    } catch (err) {
      console.error(err);
      toast.error("Failed to confirm payment.");
    } finally {
      setConfirming(false);
    }
  };

  if (loading) return <p className="p-8">Loading booking details...</p>;
  if (!booking) return <p className="p-8">No booking found.</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">
          Confirm Your Booking
        </h1>

        {/* Trip Summary */}
        <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col sm:flex-row gap-6 mb-8">
          <div className="relative w-full sm:w-1/3 h-48 rounded-xl overflow-hidden">
            <Image
              src={booking.imageUrl || "/images/fallback.jpg"}
              alt={booking.destination}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {booking.destination}
            </h2>
            <p className="text-gray-600">
              <strong>Traveler:</strong> {booking.fullName}
            </p>
            <p className="text-gray-600">
              <strong>Email:</strong> {booking.email}
            </p>
            <p className="text-gray-600">
              <strong>Date:</strong> {booking.departureDate}
            </p>
            <p className="text-gray-600">
              <strong>Travelers:</strong> {booking.travelers}
            </p>
            <p className="text-blue-700 text-lg font-semibold mt-2">
              Total: ₱{booking.totalPrice.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Payment Section */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Payment Details
          </h2>
          <p className="text-gray-600 mb-6">
            Please confirm your payment through our official channel below.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <p className="font-medium text-gray-800">
                Payment Method: <span className="text-blue-600">QRPH</span>
              </p>
              <p className="text-sm text-gray-500">
                Scan the QR code or send your payment confirmation.
              </p>
            </div>

            <div className="w-40 h-40 bg-gray-100 rounded-xl flex items-center justify-center">
              <Image
                src="/images/qrph-sample.png"
                alt="QR Code"
                width={150}
                height={150}
              />
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={handleConfirmPayment}
              disabled={confirming}
              className="bg-blue-700 text-white px-10 py-3 rounded-full hover:bg-blue-800 transition disabled:opacity-50"
            >
              {confirming ? "Processing..." : "Confirm Payment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
