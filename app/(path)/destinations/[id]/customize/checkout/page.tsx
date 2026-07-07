"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAuth } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/client";
import {
  Calendar,
  Users,
  MapPin,
  ArrowRight,
  Loader,
} from "lucide-react";

interface CustomTripData {
  tripType: "custom";
  userId: string;
  fullName: string;
  email: string;
  destinationId: string;
  destinationName: string;
  activities: Array<{ id: string; title: string; price: number; day: number }>;
  travelers: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
}

export default function CustomCheckoutPage() {
  const { id: destinationId } = useParams<{ id: string }>();
  const router = useRouter();

  const [tripData, setTripData] = useState<CustomTripData | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [destImage, setDestImage] = useState<string>("");

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("customTripData");
    if (!stored) {
      toast.error("No trip data found. Redirecting...");
      router.push(`/destinations/${destinationId}/customize`);
      return;
    }

    try {
      const data: CustomTripData = JSON.parse(stored);
      setTripData(data);

      // Load destination image from sessionStorage or fallback
      const destImageStored = sessionStorage.getItem(`destImage-${destinationId}`);
      if (destImageStored) setDestImage(destImageStored);
    } catch (err) {
      console.error("Failed to parse trip data:", err);
      toast.error("Invalid trip data");
      router.push(`/destinations/${destinationId}/customize`);
    } finally {
      setLoading(false);
    }
  }, [destinationId, router]);

  const handleConfirmPayment = async () => {
    if (!tripData) return;

    try {
      setConfirming(true);

      const user = getAuth().currentUser;
      const userId = user?.uid || tripData.userId;

      // Save custom booking to Firestore
      const bookingRef = await addDoc(collection(db, "bookings"), {
        tripType: "custom",
        userId,
        fullName: tripData.fullName,
        email: tripData.email,
        destinationId: tripData.destinationId,
        destinationName: tripData.destinationName,
        activities: tripData.activities,
        travelers: tripData.travelers,
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        totalPrice: tripData.totalPrice,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      // Clear localStorage
      localStorage.removeItem("customTripData");

      toast.success("✅ Booking confirmed! Proceeding to payment...");

      // Redirect to payment page with booking ID
      const tripDataEncoded = encodeURIComponent(JSON.stringify(tripData));
      router.push(
        `/destinations/${destinationId}/customize/payment?bookingId=${bookingRef.id}&tripData=${tripDataEncoded}`
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to confirm booking. Please try again.");
    } finally {
      setConfirming(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-cyan-600" />
      </div>
    );

  if (!tripData)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">Trip data not found.</p>
      </div>
    );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30">
        <div className="max-w-6xl mx-auto p-6 md:p-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-3">
              Confirm Your Custom Journey
            </h1>
            <p className="text-lg text-slate-600">
              Review your itinerary and complete your booking
            </p>
          </div>

          <div className="grid md:grid-cols-[1fr_0.6fr] gap-8">
            {/* LEFT: Trip Details */}
            <div className="space-y-6">
              {/* Destination Card */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="relative h-48 w-full bg-gradient-to-br from-cyan-400 to-blue-500">
                  {destImage && (
                    <Image
                      src={destImage}
                      alt={tripData.destinationName}
                      fill
                      className="object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>

                <div className="p-8">
                  <h2 className="text-3xl font-black text-slate-900 mb-2">
                    {tripData.destinationName}
                  </h2>
                  <p className="text-slate-600 mb-6">
                    Your personalized itinerary awaits
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-cyan-600" />
                        <span className="text-xs uppercase font-bold text-cyan-700">
                          Check-in
                        </span>
                      </div>
                      <p className="font-bold text-slate-900">
                        {formatDate(tripData.startDate)}
                      </p>
                    </div>

                    <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-cyan-600" />
                        <span className="text-xs uppercase font-bold text-cyan-700">
                          Check-out
                        </span>
                      </div>
                      <p className="font-bold text-slate-900">
                        {formatDate(tripData.endDate)}
                      </p>
                    </div>

                    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-emerald-600" />
                        <span className="text-xs uppercase font-bold text-emerald-700">
                          Travelers
                        </span>
                      </div>
                      <p className="font-bold text-slate-900">
                        {tripData.travelers}
                      </p>
                    </div>

                    <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-orange-600" />
                        <span className="text-xs uppercase font-bold text-orange-700">
                          Activities
                        </span>
                      </div>
                      <p className="font-bold text-slate-900">
                        {tripData.activities.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activities Breakdown */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
                <h3 className="text-2xl font-black text-slate-900 mb-6">
                  Your Activities
                </h3>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {tripData.activities.map((activity, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-cyan-100 text-cyan-700 text-xs font-bold">
                            {activity.day}
                          </span>
                          <p className="font-semibold text-slate-900">
                            {activity.title}
                          </p>
                        </div>
                        <p className="text-xs text-slate-500 ml-9">
                          Day {activity.day} Activity
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">
                          ₱{activity.price.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500">
                          x{tripData.travelers}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: Payment Summary */}
            <div className="sticky top-8 h-fit">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-8 space-y-6">
                <h3 className="text-2xl font-black text-slate-900">
                  Booking Summary
                </h3>

                <div className="space-y-4 pb-6 border-b border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-semibold text-slate-900">
                      ₱
                      {(tripData.totalPrice / tripData.travelers).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">
                      Travelers (x{tripData.travelers})
                    </span>
                    <span className="font-semibold text-slate-900">
                      x{tripData.travelers}
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-100">
                  <p className="text-xs uppercase tracking-wider text-slate-600 font-bold mb-2">
                    Total Amount
                  </p>
                  <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">
                    ₱{tripData.totalPrice.toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={handleConfirmPayment}
                  disabled={confirming}
                  className="w-full bg-gradient-to-r from-orange-500 to-blue-600 text-white font-bold py-4 px-6 rounded-2xl hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {confirming ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Book Now
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-slate-500">
                  💳 You&apos;ll pay via GCash on the next step
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
