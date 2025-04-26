'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function FutureGoals() {
  return (
    <main className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center overflow-hidden">

      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/rizal.jpg"
          alt="Future plans background"
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
        Future Roadmap
        </h2>
        <p className="text-lg md:text-xl leading-relaxed text-gray-200">
          Look forward to <span className="font-bold text-white">AI-powered itineraries</span>, 
          <span className="font-bold text-white"> community contributions</span>, 
          and smarter ways to experience the Philippines like never before.  
          <br /><br />
          The journey has just begun. 🌏✨
        </p>
      </motion.section>

    </main>
  );
}
