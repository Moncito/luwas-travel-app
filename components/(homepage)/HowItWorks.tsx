'use client'

import React from "react";
import { motion } from "framer-motion";
import { Compass, Calendar, Plane, Smartphone } from 'lucide-react';


const steps = [
  {
    title: "Explore",
    icon: <Compass className="w-8 h-10 text-white" />,
    description: "Find curated or trending destinations across the Philippines.",
  },
  {
    title: "Plan",
    icon: <Calendar className="w-8 h-10 text-white" />,
    description: "Customize your itinerary with our smart planning tools.",
  },
  {
    title: "Travel",
    icon: <Plane className="w-8 h-10 text-white" />,
    description: "Get real-time alerts and tips while you are on the go.",
  },
  {
    title: "Use the App",
    icon: <Smartphone className="w-8 h-10 text-white" />,
    description: "Access your plans on mobile anytime, even offline. Coming soon to iOS & Android!",
  },
];

export default function HowItWorks() {
  return (
    <section
    className="relative w-full min-h-screen bg-cover bg-center flex flex-col items-center justify-center px-16 py-16 text-white"
    style={{ backgroundImage: "url('images/beach1.jpeg')" }}
    >

      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/40 z-0" />

      <motion.h2
        className="relative z-10 text-4xl md:text-5xl font-bold mb-12 text-center"
        initial={{ opacity: 0, y: -40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        How Luwas Works
      </motion.h2>

      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl text-center hover:scale-105 transition-all duration-300"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
          >
            <div className="mb-4 flex justify-center">{step.icon}</div>
            <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
            <p className="text-white/80 text-sm">{step.description}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="relative z-10 text-center"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h3 className="text-3xl md:text-4xl font-bold mb-4">
          Ready for your next adventure?
        </h3>
        <p className="text-white/90 mb-6">
          Start planning with <span className="font-bold">Luwas</span> today—your all-in-one travel companion.
        </p>
        <button className="bg-white text-black font-semibold py-2 px-6 rounded-full hover:bg-gray-200 transition-all">
          Start Now
        </button>
      </motion.div>
    </section>
  );
}
