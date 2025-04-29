'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function ServicesHero() {
  return (
    <section className="relative min-h-[100vh] w-full flex items-center justify-center overflow-hidden text-white">

      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/beachServices.jpg" 
          alt="Services Background"
          fill
          priority
          className="object-cover brightness-75 scale-110 md:scale-100 transition-transform duration-700"
        />
      </div>

      {/* Soft Overlay */}
      <div className="absolute inset-0 bg-black opacity-40"></div>

      {/* Content */}
      <motion.div
        className="relative z-10 text-center px-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 drop-shadow-2xl leading-tight">
          Our Services
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
          Tailored travel solutions crafted to make your journeys unforgettable with <span className="font-bold text-white">Luwas</span>.
        </p>
      </motion.div>

    </section>
  );
}
