'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function MissionVision() {
  return (
    <main className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center overflow-hidden">
      
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/iloilo.jpg" // <<-- replace mo with your bg photo
          alt="Travel background"
          className="object-cover w-full h-full opacity-70"
          fill
        />
        <div className="absolute inset-0 bg-black opacity-40"></div> {/* Dark overlay */}
      </div>

      {/* Content */}
      <motion.section
        className="z-10 text-center max-w-3xl px-6"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
          Our Mission & Vision
        </h2>
        <p className="text-lg md:text-xl leading-relaxed text-gray-200">
          <span className="font-bold text-white">Mission:</span> Empower travelers across the Philippines through innovative, intuitive, and accessible planning tools.<br/><br/>
          <span className="font-bold text-white">Vision:</span> Become the go-to digital travel companion for every Filipino adventurer, making trips more seamless, exciting, and memorable.
        </p>
      </motion.section>

    </main>
  );
}
