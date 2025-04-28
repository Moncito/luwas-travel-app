'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Plane, Hotel, CalendarDays, MapPin } from 'lucide-react';

const services = [
  {
    title: 'Flight Booking',
    icon: Plane,
    description: 'Seamless domestic and international flight bookings at your fingertips.',
  },
  {
    title: 'Hotel Reservations',
    icon: Hotel,
    description: 'Curated stays for every type of traveler — luxury to budget-friendly.',
  },
  {
    title: 'Tour Packages',
    icon: MapPin,
    description: 'Hand-picked tour experiences to top destinations across the Philippines.',
  },
  {
    title: 'Custom Itineraries',
    icon: CalendarDays,
    description: 'Plan your trip your way with our customizable travel solutions.',
  },
];

export default function ServicesMain() {
  return (
    <section className="relative w-full overflow-hidden text-white pt-28 pb-20 px-4 md:px-8">
      
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/chinese.jpeg"
          alt="Service Background"
          fill
          className="object-cover brightness-75"
        />
      </div>

      {/* Dark Layer */}
      <div className="absolute inset-0 bg-black opacity-40 -z-10" />

      {/* Hero Text */}
      <motion.div
        className="text-center max-w-3xl mx-auto mb-16"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-4xl md:text-6xl font-bold mb-6">
          Why Travel with Luwas?
        </h2>
        <p className="text-lg md:text-xl text-gray-200 leading-relaxed">
          We connect you directly with the heart of every destination.  
          Experience personalized service, hand-picked tours, and a hassle-free journey you’ll never forget.
        </p>
      </motion.div>

      {/* Service Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-7xl mx-auto mb-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ staggerChildren: 0.2 }}
      >
        {services.map((service, index) => {
          const Icon = service.icon;
          return (
            <motion.div
              key={index}
              className="group bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-lg flex flex-col items-center text-center hover:scale-105 transition-all duration-300"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <div className="mb-4">
                <Icon className="h-10 w-10 text-white group-hover:text-gray-300 transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{service.title}</h3>
              <p className="text-white/80 group-hover:text-white text-sm">{service.description}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* CTA Button */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h3 className="text-3xl md:text-4xl font-bold mb-4">
          ✈️ Ready for your journey?
        </h3>
        <p className="text-gray-300 mb-6">
          Let us plan your next unforgettable trip with <span className="font-bold text-white">Luwas</span> today.
        </p>
        <button className="bg-white text-black font-semibold py-2 px-8 rounded-full hover:bg-gray-200 transition-all">
          Plan Your Adventure
        </button>
      </motion.div>

    </section>
  );
}
