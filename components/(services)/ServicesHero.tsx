'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function ServicesHero() {
  return (
    <section className="relative min-h-[100vh] w-full flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/beachServices.jpg"  // <-- Palitan mo dito ng gusto mong background!
          alt="Services Background"
          fill
          className="object-cover brightness-75"
        />
      </div>

      <div className="absolute inset-0 bg-black opacity-40"></div>

      {/* Content */}
      <motion.div
        className="z-10 text-center px-6"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg mb-4">
          Our Services
        </h1>
        <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto drop-shadow-md">
          Tailored travel solutions to make your journey unforgettable.
        </p>
      </motion.div>
    </section>
  );
}
