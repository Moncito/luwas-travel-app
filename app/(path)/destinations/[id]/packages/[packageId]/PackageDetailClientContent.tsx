"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CalendarDays, 
  Compass, 
  MapPin, 
  Hotel, 
  Coffee, 
  Car, 
  Plane, 
  Ticket, 
  Utensils, 
  CheckCircle2, 
  ChevronRight
} from "lucide-react";

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

interface ClientPackageDetailProps {
  pkg: TripPackage;
  destinationId: string;
  packageId: string;
  packageLocationText: string;
}

// Map inclusion text to Lucide Icons dynamically
const getInclusionIcon = (item: string) => {
  const norm = item.toLowerCase();
  if (norm.includes("hotel") || norm.includes("stay") || norm.includes("resort") || norm.includes("accommodation")) {
    return <Hotel className="h-5 w-5 text-[#2F5DFB]" />;
  }
  if (norm.includes("breakfast") || norm.includes("morning") || norm.includes("coffee")) {
    return <Coffee className="h-5 w-5 text-[#2F5DFB]" />;
  }
  if (norm.includes("lunch") || norm.includes("dinner") || norm.includes("meal") || norm.includes("food")) {
    return <Utensils className="h-5 w-5 text-[#2F5DFB]" />;
  }
  if (norm.includes("transfer") || norm.includes("airport") || norm.includes("car") || norm.includes("shuttle")) {
    return <Car className="h-5 w-5 text-[#2F5DFB]" />;
  }
  if (norm.includes("flight") || norm.includes("plane")) {
    return <Plane className="h-5 w-5 text-[#2F5DFB]" />;
  }
  if (norm.includes("guide") || norm.includes("tour") || norm.includes("sightseeing")) {
    return <Compass className="h-5 w-5 text-[#2F5DFB]" />;
  }
  if (norm.includes("ticket") || norm.includes("entry") || norm.includes("admission") || norm.includes("pass")) {
    return <Ticket className="h-5 w-5 text-[#2F5DFB]" />;
  }
  return <CheckCircle2 className="h-5 w-5 text-[#2F5DFB]" />;
};

const gridVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } }
};

export default function PackageDetailClientContent({ pkg, destinationId, packageId, packageLocationText }: ClientPackageDetailProps) {
  const [activeDay, setActiveDay] = useState(0);

  const days = pkg.dailySchedule || [];

  return (
    <div className="bg-[#FFFFFF] text-[#0F172A] selection:bg-[#EAF0FF]">
      {/* Premium Hero Section */}
      <section className="relative h-[65vh] md:h-[70vh] flex items-end justify-center text-white overflow-hidden pb-12">
        <Image
          src={pkg.imageUrl || "/images/destination-back.jpg"}
          alt={pkg.title}
          fill
          priority
          className="object-cover scale-105 select-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/40 to-transparent" />
        
        {/* Glassmorphism accents */}
        <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-gradient-to-br from-[#2F5DFB]/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-gradient-to-tr from-[#2F5DFB]/5 to-transparent rounded-full blur-3xl" />

        <div className="relative z-10 w-full max-w-5xl px-6 md:px-10 space-y-6">
          <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-white/70 font-light tracking-wide">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <span className="text-white/40">/</span>
            <Link href="/destinations" className="hover:text-white transition">Destinations</Link>
            <span className="text-white/40">/</span>
            <Link href={`/destinations/${destinationId}`} className="hover:text-white transition">Packages</Link>
            <span className="text-white/40">/</span>
            <span className="text-white font-normal">{pkg.title}</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-none drop-shadow-sm text-[#FFFFFF]">
            {pkg.title}
          </h1>

          <div className="flex flex-wrap gap-4 items-center pt-2">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 shadow-lg text-xs md:text-sm">
              <CalendarDays className="h-4 w-4 text-cyan-200" />
              <span className="text-white font-light">{pkg.duration}</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 shadow-lg text-xs md:text-sm">
              <MapPin className="h-4 w-4 text-cyan-200" />
              <span className="text-white font-light">{packageLocationText}</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4 border-t border-white/10">
            <div>
              <p className="text-xs text-white/60 uppercase tracking-widest font-semibold">Premium Experience Rate</p>
              <p className="text-3xl md:text-4xl font-black mt-1 text-[#FFFFFF]">
                ₱{pkg.price.toLocaleString()}
                <span className="text-sm text-white/70 font-light ml-1.5">per person</span>
              </p>
            </div>

            <Link
              href={`/destinations/${destinationId}/book?type=fixed&packageId=${packageId}`}
              className="inline-flex items-center justify-center bg-[#2F5DFB] hover:bg-[#1C3FC7] text-white px-8 py-4 rounded-xl font-bold tracking-wide shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0 text-center text-sm md:text-base"
            >
              Book This Package
              <ChevronRight className="ml-1.5 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 🧱 Premium Content Area */}
      <main className="max-w-5xl mx-auto px-6 py-16 md:py-24 space-y-24">
        
        {/* WHAT'S INCLUDED */}
        <section className="space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#94A3B8]">WHAT&apos;S INCLUDED</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A]">Included Privileges</h2>
            <p className="text-sm text-[#475569] max-w-md mx-auto">Every comfort is handpicked to elevate your experience in complete luxury.</p>
          </div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
            variants={gridVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {pkg.inclusions.map((inc, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="flex items-center gap-4 p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] shadow-sm hover:border-[#2F5DFB]/15 transition-colors"
              >
                <div className="p-3 bg-[#EAF0FF] rounded-lg flex-shrink-0">
                  {getInclusionIcon(inc)}
                </div>
                <span className="text-sm font-medium text-[#475569] leading-snug">{inc}</span>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* PACKAGE DESCRIPTION */}
        {pkg.description && (
          <section className="p-6 md:p-8 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-center max-w-3xl mx-auto space-y-4">
            <h3 className="text-xl font-bold text-[#0F172A]">About This Journey</h3>
            <p className="text-[#475569] leading-relaxed font-light text-base md:text-lg">
              {pkg.description}
            </p>
          </section>
        )}

        {/* DAILY ITINERARY */}
        {days.length > 0 && (
          <section className="space-y-10">
            <div className="text-center space-y-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#94A3B8]">DAILY ITINERARY</span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A]">Curated Journey Schedule</h2>
            </div>

            <div className="space-y-8">
              {/* Tabs Bar */}
              <div className="flex border-b border-[#E2E8F0] overflow-x-auto scrollbar-none pb-px">
                <div className="flex gap-2">
                  {days.map((day, i) => (
                    <button
                      key={day.day}
                      onClick={() => setActiveDay(i)}
                      className="relative px-6 py-4 text-sm font-medium transition-colors outline-none whitespace-nowrap"
                    >
                      {i === activeDay && (
                        <motion.div
                          layoutId="activeTabBg"
                          className="absolute inset-0 bg-[#EAF0FF] rounded-t-xl border-t border-x border-[#E2E8F0] -bottom-[1px]"
                          transition={{ type: "spring", stiffness: 500, damping: 35 }}
                        />
                      )}
                      <span className={`relative z-10 ${i === activeDay ? 'text-[#2F5DFB] font-bold' : 'text-[#475569]'}`}>
                        Day {day.day}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Day Details Panel */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-6 md:p-8 min-h-[180px] relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeDay}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="space-y-5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#EAF0FF] text-[#2F5DFB] font-bold text-xs flex items-center justify-center">
                        {days[activeDay].day}
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-[#0F172A]">
                        Day {days[activeDay].day} Experience
                      </h3>
                    </div>

                    <div className="space-y-3 pl-11">
                      {days[activeDay].activities.map((activity, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <span className="mt-1.5 h-2 w-2 rounded-full bg-[#2F5DFB] flex-shrink-0" />
                          <p className="text-[#475569] leading-relaxed text-sm md:text-base font-light">
                            {activity}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}