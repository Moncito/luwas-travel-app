'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export default function BookingHero() {
  return (
    <section className="relative h-[100vh] flex items-center justify-center text-white overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/vacation.png"
          alt="Plan your trip"
          fill
          className="object-cover brightness-75"
        />
      </div>

      <div className="absolute inset-0 bg-black/40 -z-10" />

      <motion.div
        className="text-center px-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
          Start Planning Your Adventure
        </h1>
        <p className="text-lg text-white/90">
          Book a trip, pick your destination, and let Luwas handle the rest.
        </p>
      </motion.div>
    </section>
  )
}
