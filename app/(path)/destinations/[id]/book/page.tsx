"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, type User } from "firebase/auth";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Calendar } from "lucide-react";
import BookingForm from "@/components/(plan-booking)/BookingForm";

interface CustomTripData {
  totalPrice: number;
  travelers: number;
  activities?: {
    id: string;
    title: string;
    price: number;
    day: number;
  }[];
  startDate?: string;
  endDate?: string;
}

export default function DestinationBookingPage() {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();

  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [customTrip, setCustomTrip] = useState<CustomTripData | null>(null);

  // 🧭 Detect trip type
  const tripType = (searchParams.get("type") as "fixed" | "custom") || "fixed";

  // ✅ Ensure this only runs on the client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ✅ Firebase Auth Check
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/sign-in");
      } else {
        setUser(currentUser);
      }
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, [router]);

  // ✅ Retrieve Custom Trip Data from localStorage
  useEffect(() => {
    if (isMounted && tripType === "custom") {
      const saved = localStorage.getItem("customTripData");
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as CustomTripData;
          setCustomTrip(parsed);
          console.log("✅ Loaded customTripData:", parsed);
        } catch (err) {
          console.error("❌ Failed to parse custom trip data:", err);
        }
      } else {
        console.warn("⚠️ No customTripData found in localStorage.");
      }
    }
  }, [tripType, isMounted]);

  // 🕒 Loading State
  if (checkingAuth || !id || typeof id !== "string" || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-orange-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-700 font-medium">Preparing your booking form...</p>
        <p className="text-sm text-gray-500">Please wait while we load the details.</p>
      </div>
    );
  }

  // 🧩 Handle client mount before rendering form (prevents hydration mismatch)
  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-orange-50 py-12 px-6">
      {/* 🧭 Header */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <span className="text-orange-500">🌍</span>
            <span className="text-blue-800">Luwas Destinations</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 flex items-center gap-2">
            <Calendar size={26} className="text-blue-700" />
            {tripType === "custom"
              ? "Plan Your Custom Itinerary"
              : "Confirm Your Destination Booking"}
          </h1>

          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
            {tripType === "custom"
              ? "Design your dream trip — choose your activities, schedule, and experience."
              : "Book your adventure today and start exploring with LUWAS."}
          </p>
        </div>
      </div>

      {/* 🧾 Booking Form */}
      <div className="max-w-6xl mx-auto">
        <BookingForm
          destinationId={id}
          user={user}
          tripType={tripType}
          packageId={searchParams.get("packageId") || null}
          {...(tripType === "custom"
            ? {
                customTotal: customTrip?.totalPrice || 0,
                customTravelers: customTrip?.travelers || 1,
                customActivities: customTrip?.activities || [],
                customDates: {
                  startDate: customTrip?.startDate,
                  endDate: customTrip?.endDate,
                },
              }
            : {})}
        />
      </div>
    </div>
  );
}
