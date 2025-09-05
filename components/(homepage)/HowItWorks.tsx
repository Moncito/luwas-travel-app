'use client'

import React from "react";
import { motion } from "framer-motion";
import { Compass, Calendar, Plane, Smartphone } from "lucide-react";

const steps = [
  {
    title: "Explore",
    icon: <Compass className="w-10 h-10 text-white" />,
    description: "Discover curated and trending destinations across the Philippines.",
  },
  {
    title: "Plan",
    icon: <Calendar className="w-10 h-10 text-white" />,
    description: "Personalized itineraries crafted for your perfect travel experience.",
  },
  {
    title: "Travel",
    icon: <Plane className="w-10 h-10 text-white" />,
    description: "Get real-time updates, guides, and tips while you’re on the go.",
  },
  {
    title: "Use the App",
    icon: <Smartphone className="w-10 h-10 text-white" />,
    description: "Access your plans anytime—even offline. Coming soon to iOS!",
  },
];

export default function HowItWorks() {
  return (
    <section
      className="relative w-full min-h-screen bg-cover bg-center flex flex-col items-center justify-center px-6 md:px-16 py-20 text-white"
      style={{ backgroundImage: "url('/images/beach1.jpeg')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] z-0" />

      {/* Title */}
      <motion.h2
        className="relative z-10 text-3xl md:text-5xl font-bold mb-12 text-center"
        initial={{ opacity: 0, y: -40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        How <span className="text-teal-300">Luwas</span> Works
      </motion.h2>

      {/* Steps Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20 w-full max-w-6xl">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-lg text-center hover:scale-105 hover:shadow-xl hover:shadow-white/20 transition-all duration-300"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
          >
            <div className="mb-5 flex justify-center">{step.icon}</div>
            <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
            <p className="text-white/80 text-sm leading-relaxed">{step.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Call-to-Action */}
      <motion.div
        className="relative z-10 text-center max-w-2xl"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h3 className="text-2xl md:text-4xl font-bold mb-4">
          Ready for your next adventure?
        </h3>
        <p className="text-white/90 text-base md:text-lg">
          Start planning with <span className="font-bold text-teal-300">Luwas</span> today — 
          your all-in-one travel companion.
        </p>
      </motion.div>
    </section>
  );
}
