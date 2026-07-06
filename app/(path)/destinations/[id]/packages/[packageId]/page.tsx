// File: app/destinations/[id]/packages/[packageId]/page.tsx
import { db } from "@/firebase/admin";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CalendarDays, CheckCircle2, MapPin } from "lucide-react";

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
  packageLocation?: string;
  destinationLocation?: string;
}

interface Props {
  params: Promise<{ id: string; packageId: string }>;
}

export default async function PackageDetailPage({ params }: Props) {
  const { id: destinationId, packageId } = await params;
  const destinationSnap = await db.collection("destinations").doc(destinationId).get();
  const destinationLocation = destinationSnap.exists
    ? destinationSnap.data()?.location || ""
    : "";

  const docSnap = await db.collection("tripPackages").doc(packageId).get();
  if (!docSnap.exists) return notFound();

  const pkg = docSnap.data() as TripPackage;
  if (pkg.destinationId !== destinationId) return notFound();
  const packageLocationText =
    pkg.packageLocation || pkg.destinationLocation || destinationLocation || "Inside this destination";

  return (
    <>
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative h-[65vh] flex items-center justify-center text-center text-white">
        <Image
          src={pkg.imageUrl || "/images/destination-back.jpg"}
          alt={pkg.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

        <div className="relative z-10 max-w-3xl px-6 space-y-5">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            {pkg.title}
          </h1>
          <p className="text-blue-100 font-medium text-lg">{pkg.duration}</p>
          <p className="text-blue-100 font-medium text-sm flex items-center justify-center gap-1">
            <MapPin className="h-4 w-4" />
            {packageLocationText}
          </p>
          <p className="text-2xl font-semibold text-white">
            ₱{pkg.price.toLocaleString()}
            <span className="text-sm text-gray-300 font-normal ml-1">
              per person
            </span>
          </p>

          <div className="pt-4">
            <Link
              href={`/destinations/${destinationId}/book?type=fixed&packageId=${packageId}`}
              className="inline-block bg-blue-700 hover:bg-blue-800 text-white px-10 py-4 rounded-lg font-semibold shadow-lg transition"
            >
              Book This Package
            </Link>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="bg-white text-gray-900 py-20 px-6">
        <div className="max-w-6xl mx-auto space-y-24">

          {/* WHAT’S INCLUDED */}
          <section>
            <h3 className="text-3xl font-semibold text-blue-800 text-center mb-10 flex items-center justify-center gap-2">
              <CheckCircle2 className="h-7 w-7 text-blue-600" />
              What’s Included
            </h3>

            <div className="flex flex-wrap justify-center gap-3">
              {pkg.inclusions.map((inc, i) => (
                <span
                  key={i}
                  className="text-sm bg-gray-100 hover:bg-blue-50 text-gray-800 border border-gray-200 px-4 py-2 rounded-full shadow-sm transition"
                >
                  {inc}
                </span>
              ))}
            </div>
          </section>

          {/* PACKAGE DESCRIPTION */}
          {pkg.description && (
            <section className="max-w-3xl mx-auto text-center space-y-4">
              <h3 className="text-2xl font-semibold text-blue-800">
                About This Package
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {pkg.description}
              </p>
            </section>
          )}

          {/* DAILY ITINERARY */}
{/* 🗓️ Daily Itinerary */}
<section>
  <h3 className="text-3xl font-semibold text-center text-blue-800 mb-12 flex items-center justify-center gap-2">
    <CalendarDays className="h-7 w-7 text-blue-600" />
    Daily Itinerary
  </h3>

  <div className="relative max-w-5xl mx-auto">
    {/* Central Vertical Line */}
    <div className="absolute left-1/2 transform -translate-x-1/2 w-[2px] bg-gradient-to-b from-blue-400 via-blue-200 to-transparent h-full rounded-full" />

    <div className="space-y-20 relative z-10">
      {pkg.dailySchedule.map((day, i) => (
        <div
          key={i}
          className={`relative flex flex-col md:flex-row items-center gap-8 ${
            i % 2 === 0 ? "md:flex-row-reverse" : ""
          }`}
        >
          {/* Connector Dot */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-5 h-5 bg-blue-600 rounded-full border-4 border-white shadow-md" />

          {/* Itinerary Card */}
          <div
            className={`md:w-1/2 bg-gray-50 border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 
            ${i % 2 === 0 ? "md:text-right" : "md:text-left"} p-8`}
          >
            <h4 className="text-2xl font-bold text-blue-800 mb-2">
              Day {day.day}
            </h4>
            <ul className="text-gray-700 space-y-1 leading-relaxed">
              {day.activities.map((act, j) => (
                <li key={j}>{act}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

        </div>
      </main>

      <Footer />
    </>
  );
}
