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
    <div className="my-16 px-6 text-center max-w-5xl mx-auto">

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

      {/* Stats */}
      <motion.div
        ref={refStats}
        variants={fadeUp}
        initial="hidden"
        animate={inViewStats ? 'visible' : 'hidden'}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-700 mb-10"
      >
        {[
          { label: "+50", desc: "Curated Destinations" },
          { label: "100%", desc: "Personalized Itinerary" },
          { label: "24/7", desc: "Real-Time Travel Updates" },
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
          >
            <h3 className="text-2xl font-bold text-user-primary">{item.label}</h3>
            <p>{item.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Trending Destinations */}
      <motion.h2
        className="text-2xl font-bold mb-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
      Trending Destinations
      </motion.h2>

      <motion.div
        className="grid gap-10 sm:grid-cols-2 md:grid-cols-3"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          visible: { transition: { staggerChildren: 0.2 } },
        }}
      >
        {trendingDestinations.map((dest, index) => (
          <motion.div
            key={index}
            className="rounded-2xl shadow-lg overflow-hidden bg-white transition-transform"
            variants={fadeUp}
            whileHover={{ scale: 1.05, boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.2)" }}
          >
            <Image
              src={dest.image}
              alt={dest.name}
              width={500}
              height={300}
              className="w-full h-80 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold">{dest.name}</h3>
              <p className="text-sm text-gray-500">{dest.tag}</p>
              <button className="mt-3 text-user-primary font-medium hover:underline">
                Explore →
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Show;
