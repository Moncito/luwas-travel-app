// File: components/itineraries/AnimatedHero.tsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function AnimatedHero({ image, title, location }: { image: string; title: string; location: string }) {
  return (
    <section className="relative h-[60vh]">
      <Image src={image} alt={title} fill className="object-cover brightness-75" />
      <div className="absolute inset-0 bg-black/40" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute z-10 bottom-24 left-1/2 transform -translate-x-1/2 text-center px-6"
      >
        <h1 className="text-5xl font-bold text-white drop-shadow-lg">{title}</h1>
        <p className="text-white/80">{location}</p>
      </motion.div>
    </section>
  );
}
