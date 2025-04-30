'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, PlaneTakeoff, MapPin } from 'lucide-react';
import travelHistory from '@/components/(travel-history)/mockTravelHistory';
import Image from 'next/image';

const FILTERS = ['Upcoming', 'Completed', 'Cancelled'] as const;
type TripStatus = typeof FILTERS[number];

export default function TravelTimeline() {
  const [filter, setFilter] = useState<TripStatus>('Upcoming');

  const filteredTrips = travelHistory.filter(trip => trip.status === filter);

  return (
    <section className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden text-white py-16 px-6">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/vacation.png"
          alt="Travel History"
          fill
          priority
          className="object-cover brightness-75"
        />
      </div>
      <div className="absolute inset-0 bg-black/40 -z-10" />

      {/* Title */}
      <h2 className="text-5xl font-bold mb-10 text-white text-center">Your Travel History</h2>

      {/* Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {FILTERS.map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 font-semibold rounded-full transition-all ${
              filter === status
                ? 'bg-white text-black'
                : 'bg-white/30 text-white hover:bg-white/50'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Travel Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        {filteredTrips.length === 0 ? (
          <p className="col-span-full text-center text-white/70">
            No trips found for "{filter}"
          </p>
        ) : (
          filteredTrips.map((trip, index) => (
            <motion.div
              key={index}
              className="flex flex-col bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl p-6 shadow-md transition duration-300 hover:scale-105"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="mb-2 flex items-center gap-2">
                <PlaneTakeoff className="w-5 h-5 text-white" />
                <h3 className="text-xl font-bold">{trip.destination}</h3>
              </div>

              <p className="text-sm text-white/80 mb-2">{trip.description}</p>

              <div className="text-sm text-white/70 flex items-center mb-1">
                <CalendarDays className="w-4 h-4 mr-2" />
                {trip.date}
              </div>

              <div className="text-sm text-white/70 flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                {trip.location}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </section>
  );
}
