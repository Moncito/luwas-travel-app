'use client';

import { motion } from 'framer-motion';

export default function OurStory() {
  return (
    <motion.section
      className="relative min-h-screen flex items-center justify-center px-8 py-16 text-white overflow-hidden"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      {/* Background GIF layer */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: "url('/about.jpg')" }}
      />

      {/* Overlay (optional to make text readable) */}
      <div className="absolute inset-0 bg-black opacity-40"></div>

      {/* Content */}
      <div className="relative z-20 text-center max-w-3xl">
        <h2 className="text-6xl font-bold mb-4">Our Story</h2>
        <p className="text-lg text-white/90">
          Born from the desire to simplify Philippine travel, Luwas was founded with a mission to empower every
          adventurer to explore, plan, and travel smartly. What started as a simple idea has now grown into a full-featured digital companion for local explorers.
        </p>
      </div>
    </motion.section>
  );
}
