"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase/client";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CalendarDays, CheckCircle2, MapPin } from "lucide-react";
import { motion } from "framer-motion";

interface TripPackage {
  id: string;
  title: string;
  duration: string;
  description: string;
  price: number;
  inclusions: string[];
  dailySchedule: { day: number; activities: string[] }[];
  imageUrl?: string;
  destinationId: string;
}

export default function PackageDetailClient({
  destinationId,
  packageId,
}: {
  destinationId: string;
  packageId: string;
}) {
  const [pkg, setPkg] = useState<TripPackage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!packageId) {
          console.error("❌ Missing packageId in route params");
          return;
        }

        const ref = doc(db, "tripPackages", packageId);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setPkg({ id: snap.id, ...(snap.data() as TripPackage) });
        } else {
          console.error("❌ No package found with ID:", packageId);
        }
      } catch (err) {
        console.error("🔥 Error fetching package:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [packageId]);

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mb-3"></div>
        <p className="text-gray-600 font-medium">Loading travel package...</p>
      </div>
    );

  if (!pkg)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <p className="text-lg">Package not found.</p>
        <Link
          href={`/destinations/${destinationId}/packages`}
          className="mt-4 text-blue-600 hover:underline"
        >
          ← Back to Packages
        </Link>
      </div>
    );

  return (
    <>
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative h-[70vh] flex items-center justify-center text-center text-white">
        <Image
          src={pkg.imageUrl || "/images/destination-back.jpg"}
          alt={pkg.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />

        <div className="relative z-10 max-w-3xl px-6 space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-md">
            {pkg.title}
          </h1>
          <p className="text-blue-100 font-medium text-lg flex items-center justify-center gap-2">
            <MapPin size={18} className="text-blue-300" />
            {pkg.duration}
          </p>
          <p className="text-2xl font-semibold text-white">
            ₱{pkg.price.toLocaleString()}{" "}
            <span className="text-sm text-gray-300 font-normal">
              per person
            </span>
          </p>

          <div className="pt-4">
            <Link
              href={`/destinations/${destinationId}/book?type=fixed&packageId=${packageId}`}
              className="inline-block bg-blue-700 hover:bg-blue-800 text-white px-10 py-4 rounded-full font-semibold shadow-md transition"
            >
              Proceed to Booking →
            </Link>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="bg-white text-gray-900 py-24 px-6">
        <div className="max-w-6xl mx-auto space-y-20">
          {/* WHAT’S INCLUDED */}
          <section className="text-center">
            <h3 className="text-3xl font-semibold text-blue-800 mb-8 flex items-center justify-center gap-2">
              <CheckCircle2 className="h-7 w-7 text-green-600" />
              What’s Included
            </h3>

            <div className="flex flex-wrap justify-center gap-3">
              {pkg.inclusions.map((inc, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  viewport={{ once: true }}
                  className="text-sm bg-gray-100 hover:bg-blue-50 text-gray-800 border border-gray-200 px-4 py-2 rounded-full shadow-sm transition"
                >
                  {inc}
                </motion.span>
              ))}
            </div>
          </section>

          {/* DAILY ITINERARY */}
          <section>
            <h3 className="text-3xl font-semibold text-center text-blue-800 mb-12 flex items-center justify-center gap-2">
              <CalendarDays className="h-7 w-7 text-blue-600" />
              Daily Itinerary
            </h3>

            <div className="relative border-l border-blue-200 max-w-3xl mx-auto">
              {pkg.dailySchedule.map((day, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="relative pl-10 pb-10"
                >
                  <div className="absolute left-0 top-2 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow" />
                  <div className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition">
                    <h4 className="text-xl font-semibold text-blue-800 mb-2">
                      Day {day.day}
                    </h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {day.activities.map((act, j) => (
                        <li key={j}>{act}</li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
