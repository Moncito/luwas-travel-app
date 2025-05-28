'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function OurStory() {
  return (
    <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden text-white">
      
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/about.jpg" 
          alt="Our Story Background"
          fill
          priority
          className="object-cover brightness-75 scale-110 md:scale-100 transition-transform duration-700"
        />
      </div>

      {/* Soft Black Overlay */}
      <div className="absolute inset-0 bg-black opacity-40"></div>

      {/* Hero Content */}
      <motion.div
        className="relative z-10 text-center max-w-3xl px-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight drop-shadow-2xl">
          Our Story
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-gray-200 leading-relaxed">
          Born from the desire to simplify Philippine travel, <span className="font-bold text-white">Luwas</span> empowers every adventurer to explore, plan, and travel smartly. What started as a dream is now a full-featured digital companion for Filipino explorers.
        </p>
      </motion.div>

    </section>
  );
}
