"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Image from "next/image";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/client";
import type { User } from "firebase/auth";
import {
  Mail,
  Phone,
  Calendar,
  Users,
  User as UserIcon,
  Home,
  CloudSun,
} from "lucide-react";

interface Props {
  promoId: string;
  user: User;
}

interface Promo {
  title: string;
  price: number;
  discountPercentage: number;
  finalPrice: number;
  latitude: number;
  longitude: number;
  imageUrl?: string;
}

interface Weather {
  summary: string;
  temperature: number;
  icon?: string;
}

function IconInput({ icon: Icon, ...props }: any) {
  return (
    <div className="relative w-full">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" size={18} />
      <input
        {...props}
        className="pl-10 pr-4 py-3 w-full rounded-lg border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
      />
    </div>
  );
}

export default function PromoBookingForm({ promoId, user }: Props) {
  const [promo, setPromo] = useState<Promo | null>(null);
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState<Weather | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    localAddress: "",
    departureDate: "",
    travelers: 1,
    specialRequests: "",
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.displayName || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchPromo = async () => {
      try {
        const docRef = doc(db, "promos", promoId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPromo(docSnap.data() as Promo);
        } else {
          toast.error("Promo not found.");
        }
      } catch (error) {
        toast.error("Failed to fetch promo.");
        console.error(error);
      }
    };

    fetchPromo();
  }, [promoId]);

  useEffect(() => {
    const fetchWeather = async () => {
      if (promo?.latitude && promo?.longitude && formData.departureDate) {
        try {
          const res = await fetch(
            `/api/weather?lat=${promo.latitude}&lon=${promo.longitude}&date=${formData.departureDate}`
          );
          const data = await res.json();
          if (data) setWeather(data);
        } catch (err) {
          console.warn("⚠️ Weather fetch failed", err);
        }
      }
    };
    fetchWeather();
  }, [promo, formData.departureDate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "travelers" ? Number(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promo) return;
    setLoading(true);

    try {
      const totalPrice = formData.travelers * promo.price;
      const discountApplied = totalPrice * (promo.discountPercentage / 100);
      const finalPrice = totalPrice - discountApplied;

      const res = await fetch("/api/promo-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          userId: user.uid,
          promoId,
          totalPrice,
          finalPrice,
          paymentMethod: "PayMongo",
        }),
      });

      if (!res.ok) throw new Error("Failed to create promo booking");
      const data = await res.json();

      toast.success("Booking submitted! Redirecting to payment...");

      const payRes = await fetch("/api/paymongo/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          amount: finalPrice,
          bookingId: data.id,
          promoId,
          successType: "promo",
        }),
      });

      const payData = await payRes.json();
      if (payData?.url) {
        setTimeout(() => {
          window.location.href = payData.url;
        }, 1200);
      } else {
        toast.error("❌ Payment failed. Try again.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Promo booking error:", err);
      toast.error("Something went wrong.");
      setLoading(false);
    }
  };

  if (!promo) return null;

  const totalPrice = formData.travelers * promo.price;
  const discountApplied = totalPrice * (promo.discountPercentage / 100);
  const finalPrice = totalPrice - discountApplied;

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center px-4 py-12">
      <motion.div
        className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Left: Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl border border-gray-200 space-y-6"
        >
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
            Book This Promo
          </h2>
          <p className="text-sm text-gray-600">
            Fill in your details to confirm your reservation
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <IconInput
              icon={UserIcon}
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Full Name"
              required
            />
            <IconInput
              icon={Mail}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
            />
            <IconInput
              icon={Phone}
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              required
            />
            <IconInput
              icon={Home}
              name="localAddress"
              value={formData.localAddress}
              onChange={handleChange}
              placeholder="Local Address"
              required
            />
            <IconInput
              icon={Calendar}
              type="date"
              name="departureDate"
              value={formData.departureDate}
              min={new Date().toISOString().split("T")[0]} // ⛔ prevent past dates
              onChange={handleChange}
              required
            />
            <IconInput
              icon={Users}
              type="number"
              min={1}
              name="travelers"
              value={formData.travelers}
              onChange={handleChange}
              placeholder="Travelers"
              required
            />
          </div>

          <textarea
            name="specialRequests"
            value={formData.specialRequests}
            onChange={handleChange}
            placeholder="Special Requests"
            rows={3}
            className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          />

          <div className="text-center">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white px-8 py-3 rounded-full font-bold hover:from-blue-700 hover:to-purple-800 transition shadow-lg disabled:opacity-50"
            >
              {loading ? "Processing..." : "Book Promo Now"}
            </button>
            <p className="text-xs text-gray-400 mt-2">
              Secure checkout via PayMongo
            </p>
          </div>
        </form>

        {/* Right: Promo Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {promo.imageUrl && (
            <Image
              src={promo.imageUrl}
              alt={promo.title}
              width={800}
              height={400}
              className="w-full h-56 object-cover"
            />
          )}
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-indigo-700">
                {promo.title}
              </h3>
              <span className="bg-gradient-to-r from-green-400 to-emerald-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow">
                -{promo.discountPercentage}%
              </span>
            </div>

            <div className="space-y-1 text-gray-700">
              <p>
                Price per person:{" "}
                <span className="font-semibold text-blue-700">
                  ₱{promo.price.toLocaleString()}
                </span>
              </p>
              <p>
                Discount:{" "}
                <span className="font-semibold text-green-600">
                  {promo.discountPercentage}%
                </span>
              </p>
              <p>
                Total Price:{" "}
                <span className="font-semibold">
                  ₱{totalPrice.toLocaleString()}
                </span>
              </p>
              <motion.p
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4 }}
                className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent"
              >
                Final Price: ₱{finalPrice.toLocaleString()}
              </motion.p>
            </div>

            {/* Weather Card */}
            {weather && (
              <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center gap-3 text-sm text-indigo-700 border border-indigo-100">
                <CloudSun className="w-5 h-5" />
                <span>
                  {weather.summary} • {weather.temperature}°C
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
