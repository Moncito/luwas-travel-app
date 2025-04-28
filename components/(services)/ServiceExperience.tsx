'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function ServiceExperience() {
  return (
    <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/chinese.jpeg" 
          alt="Why Travel with Luwas"
          fill
          className="object-cover brightness-75"
        />
      </div>

      <div className="absolute inset-0 bg-black opacity-40"></div>

      {/* Content */}
      <motion.div
        className="z-10 text-center max-w-3xl px-6"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-5xl font-bold mb-6 text-white">
          Why Travel with Luwas?
        </h2>
        <p className="text-lg text-gray-200 leading-relaxed">
          We connect you directly with the heart of every destination.  
          Experience personalized service, hand-picked tours, and a hassle-free journey you’ll never forget.
        </p>
      </motion.div>
    </section>
  );
}
