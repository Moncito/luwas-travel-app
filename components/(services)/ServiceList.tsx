'use client';

import { motion } from 'framer-motion';
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

export default function ServiceList() {
  return (
    <section className="w-full py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
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
                className="group bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-lg flex flex-col items-center text-center hover:bg-black hover:text-white transition-all duration-300"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <div className="mb-4">
                  <Icon className="h-10 w-10 text-black group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                <p className="text-gray-600 group-hover:text-gray-300 text-sm">{service.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
