"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const textVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: i * 0.3, ease: "easeOut" },
  }),
};

const HeroSection = () => (
  <div className="relative w-full h-screen overflow-hidden">
    {/* Background Image */}
    <Image
      src="/landingpage.png"
      alt="Philippines Scenic View"
      fill
      priority
      className="object-cover"
    />

    {/* Subtle Overlay */}
    <div className="absolute inset-0 bg-black/25 z-10" />

    {/* Hero Content */}
    <div className="absolute z-20 top-1/2 transform -translate-y-1/2 px-6 md:px-18 w-full md:w-auto text-center md:text-left">
      <motion.h1
        variants={textVariant}
        initial="hidden"
        animate="visible"
        custom={0}
        className="text-3xl sm:text-5xl md:text-6xl font-bold leading-tight text-white drop-shadow-md max-w-2xl mx-auto md:mx-0"
      >
        Weaving Your Dreams into{" "}
        <span className="bg-gradient-to-r from-teal-300 to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
          Unforgettable Adventures
        </span>
      </motion.h1>

      <motion.p
        variants={textVariant}
        initial="hidden"
        animate="visible"
        custom={1}
        className="mt-4 text-base sm:text-lg md:text-xl text-white/90 leading-relaxed max-w-md mx-auto md:mx-0 drop-shadow"
      >
        Discover breathtaking destinations, plan your dream trip, and travel
        with ease — your next adventure starts here.
      </motion.p>

      {/* Buttons */}
      <motion.div
        variants={textVariant}
        initial="hidden"
        animate="visible"
        custom={2}
        className="mt-6 flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
      >
        <Link href="/destinations">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="cursor-pointer px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-full shadow-lg transition-all duration-300"
          >
            Destinations
          </motion.button>
        </Link>

        <Link href="/itineraries">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="cursor-pointer px-6 py-3 border border-white/70 text-white font-medium rounded-full bg-white/10 hover:bg-white hover:text-black transition-all duration-300 backdrop-blur-sm"
          >
            Itineraries
          </motion.button>
        </Link>
      </motion.div>
    </div>

    {/* Scroll Indicator */}
    <motion.div
      animate={{ y: [0, 8, 0] }}
      transition={{ repeat: Infinity, duration: 1.6, delay: 1.5 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-lg z-20 drop-shadow-lg"
    >
      ↓
    </motion.div>
  </div>
);

export default HeroSection;
