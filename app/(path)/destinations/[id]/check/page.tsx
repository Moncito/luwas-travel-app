"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Plane, Map, CalendarDays } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";

export default function BookDestinationPage() {
  const { id: destinationId } = useParams();

  return (
    <>
      <Navbar />

      {/* 🌅 Hero Background Section */}
      <section className="relative min-h-screen flex flex-col justify-center items-center text-white">
        {/* Background Image */}
        <div className="absolute inset-0 -z-10">
          <Image
            src="/images/destination-back.jpg"
            alt="Travel Background"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" /> {/* Dark overlay */}
        </div>

        {/* Content */}
        <div className="text-center px-6 py-28 max-w-5xl mx-auto space-y-12">
          {/* Title and Subtitle */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg">
              Plan Your Trip
            </h1>
            <p className="text-gray-200 max-w-2xl mx-auto leading-relaxed">
              Choose how you want to experience this destination — pick from our
              curated travel packages or customize your own unforgettable journey.
            </p>
          </div>

          {/* Selection Cards */}
          <div className="grid md:grid-cols-2 gap-8 mt-16">
            {/* Fixed Packages Card */}
            <Link
              href={`/destinations/${destinationId}/packages`}
              className="group bg-white/10 border border-white/20 rounded-2xl p-10 shadow-lg hover:bg-white/20 transition-transform hover:-translate-y-1 backdrop-blur-md"
            >
              <div className="flex flex-col items-center space-y-4">
                <Plane className="h-14 w-14 text-blue-300 group-hover:scale-110 transition" />
                <h2 className="text-2xl font-semibold text-white">
                  Choose a Fixed Trip Package
                </h2>
                <p className="text-gray-200 leading-relaxed">
                  Explore curated trips with hotels, tours, and transportation
                  already arranged for you.
                </p>
                <span className="text-blue-300 font-medium group-hover:underline mt-2">
                  View Packages →
                </span>
              </div>
            </Link>

            {/* Custom Trip Card */}
            <Link
              href={`/destinations/${destinationId}/customize`}
              className="group bg-white/10 border border-white/20 rounded-2xl p-10 shadow-lg hover:bg-white/20 transition-transform hover:-translate-y-1 backdrop-blur-md"
            >
              <div className="flex flex-col items-center space-y-4">
                <Map className="h-14 w-14 text-green-300 group-hover:scale-110 transition" />
                <h2 className="text-2xl font-semibold text-white">
                  Plan Your Own Trip
                </h2>
                <p className="text-gray-200 leading-relaxed">
                  Choose your travel dates, handpick activities, and tailor your
                  adventure to your liking.
                </p>
                <span className="text-green-300 font-medium group-hover:underline mt-2">
                  Start Customizing →
                </span>
              </div>
            </Link>
          </div>

          {/* Bottom Tip */}
          <div className="mt-16 flex items-center justify-center gap-2 text-gray-300 text-sm">
            <CalendarDays className="h-5 w-5" />
            <p className="text-white">
              You can always come back here to switch between trip types before booking.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
