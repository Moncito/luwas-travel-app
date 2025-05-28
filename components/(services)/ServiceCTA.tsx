'use client';

import { motion } from 'framer-motion';

export default function ServiceCTA() {
  return (
    <section className="bg-user-primary text-white py-16 flex flex-col items-center justify-center px-6 text-center">
      <motion.h2
        className="text-3xl md:text-4xl font-bold mb-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Ready to start your adventure?
      </motion.h2>
      <motion.p
        className="mb-8 text-white/90 max-w-md"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Plan, book, and explore with Luwas. Travel smarter, travel better.
      </motion.p>
      <motion.button
        className="bg-white text-black font-semibold px-6 py-3 rounded-full hover:bg-gray-300 transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Plan Your Trip
      </motion.button>
    </section>
  );
}
