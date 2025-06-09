'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

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

    {/* Gradient Overlay */}
    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/30 to-black/10 z-10" />

    {/* Animated Text Overlay */}
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.3 }}
      className="absolute z-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-6 text-white text-center"
    >
      <h1 className="text-4xl md:text-6xl font-great-vibes font-semibold drop-shadow-xl tracking-wide">
        YOUR PATH TO ADVENTURE
      </h1>
      <p className="mt-4 text-lg md:text-xl text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.75)]">
        Discover your journey with us today...
      </p>

      {/* Buttons Container */}
      <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
        <Link href="/destinations">
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="px-6 py-3 bg-white text-black hover:bg-gray-100 font-medium rounded-full shadow-md transition duration-300 cursor-pointer"
          >
            Explore Destinations
          </motion.button>
        </Link>

        <Link href="/itineraries">
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="px-6 py-3 bg-white text-black hover:bg-gray-100 font-medium rounded-full shadow-md transition duration-300 cursor-pointer "
          >
            Explore Itineraries
          </motion.button>
        </Link>
      </div>
    </motion.div>
  </div>
);

export default HeroSection;
