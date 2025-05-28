'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function DestinationsHero() {
  return (
    <section className="relative min-h-[100vh] flex flex-col items-center justify-center overflow-hidden text-white">
      
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/old.png"
          alt="Explore Destinations"
          fill
          priority 
          className="object-cover brightness-75 scale-110 md:scale-100 transition-transform duration-700"
        />
      </div>

      {/* Soft dark gradient overlay */}
      {/* <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/70 z-0" /> */}

      {/* Hero Content */}
      <motion.div
        className="relative z-10 text-center px-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-2xl leading-tight">
          Explore the Philippines 🇵🇭
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed mb-8">
          Find breathtaking destinations for your next unforgettable journey with <span className="text-white font-bold">Luwas</span>.
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white text-black font-semibold px-6 py-2 sm:px-8 sm:py-3 rounded-full hover:bg-gray-200 transition-all"
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
            }
          }}
        >
          Start Exploring
        </motion.button>
      </motion.div>

    </section>
  );
}
