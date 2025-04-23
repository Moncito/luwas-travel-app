'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const trendingDestinations = [
  {
    name: "El Nido, Palawan",
    tag: "Beach Paradise",
    image: "/images/el-nido.jpg",
  },
  {
    name: "Vigan, Ilocos Sur",
    tag: "Heritage City",
    image: "/images/vigan.jpg",
  },
  {
    name: "Baguio City",
    tag: "Cool Mountain Escape",
    image: "/images/baguio.jpg",
  },
];

const Show = () => {
  const [refTitle, inViewTitle] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [refDesc, inViewDesc] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [refStats, inViewStats] = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <div className="my-16 px-6 text-center max-w-4xl mx-auto">

      {/* Hero Title */}
      <motion.h2
        ref={refTitle}
        variants={fadeUp}
        initial="hidden"
        animate={inViewTitle ? 'visible' : 'hidden'}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold mb-4 text-user-primary"
      >
        Discover the Philippines with Luwas
      </motion.h2>

      {/* Hero Description */}
      <motion.p
        ref={refDesc}
        variants={fadeUp}
        initial="hidden"
        animate={inViewDesc ? 'visible' : 'hidden'}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-gray-600 text-lg mb-8"
      >
        Luwas is your all-in-one travel companion—plan personalized trips, explore breathtaking
        destinations, and stay up-to-date with real-time travel info across the Philippines.
      </motion.p>

      {/* Descriptive Analytics */}
      <motion.div
        ref={refStats}
        variants={fadeUp}
        initial="hidden"
        animate={inViewStats ? 'visible' : 'hidden'}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-700 mb-10"
      >
        <div>
          <h3 className="text-2xl font-bold text-user-primary">+50</h3>
          <p>Curated Destinations</p>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-user-primary">100%</h3>
          <p>Personalized Itinerary</p>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-user-primary">24/7</h3>
          <p>Real-Time Travel Updates</p>
        </div>
      </motion.div>

 {/* Trending Destinations */}
 <h2 className="text-2xl font-bold mb-6">🌟 Trending Destinations</h2>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {trendingDestinations.map((dest, index) => (
          <div
            key={index}
            className="rounded-2xl shadow-lg overflow-hidden bg-white transition-transform hover:scale-[1.03]"
          >
            <Image
              src={dest.image}
              alt={dest.name}
              width={500}
              height={300}
              className="w-full h-70 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold">{dest.name}</h3>
              <p className="text-sm text-gray-500">{dest.tag}</p>
              <button className="mt-3 text-user-primary font-medium hover:underline">
                Explore →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Show;
