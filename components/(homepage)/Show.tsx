'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import Link from 'next/link';
import { collection, onSnapshot, limit, query } from 'firebase/firestore';
import { db } from '@/firebase/client';

interface Destination {
  id: string;
  name: string;
  location: string;
  tags?: string[];
  imageUrl?: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const Show = () => {
  const [refTitle, inViewTitle] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [refDesc, inViewDesc] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [refStats, inViewStats] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [destinations, setDestinations] = useState<Destination[]>([]);

  // ✅ Fetch real destinations from Firestore (top 3)
  useEffect(() => {
    const q = query(collection(db, 'destinations'), limit(3));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Destination[];
      setDestinations(data);
    });
    return () => unsub();
  }, []);

  return (
    <div className="py-20 px-6 text-center max-w-5xl mx-auto">

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
          { label: '+50', desc: 'Curated Destinations' },
          { label: '100%', desc: 'Personalized Itinerary' },
          { label: '24/7', desc: 'Real-Time Travel Updates' },
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

      {/* Trending Destinations — now from Firestore */}
      <motion.h2
        className="text-2xl font-bold mb-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Trending Destinations
      </motion.h2>

      {destinations.length === 0 ? (
        // Skeleton loader while fetching
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl overflow-hidden bg-gray-100 animate-pulse">
              <div className="w-full h-80 bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          className="grid gap-10 sm:grid-cols-2 md:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            visible: { transition: { staggerChildren: 0.2 } },
          }}
        >
          {destinations.map((dest) => (
            <motion.div
              key={dest.id}
              className="rounded-2xl shadow-lg overflow-hidden bg-white transition-transform"
              variants={fadeUp}
              whileHover={{ scale: 1.05, boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.2)' }}
            >
              <div className="relative w-full h-80">
                <Image
                  src={dest.imageUrl || '/images/fallback.jpg'}
                  alt={dest.name}
                  fill
                  unoptimized
                  className="object-cover"
                />
                {/* Tag badge */}
                {dest.tags && dest.tags.length > 0 && (
                  <span className="absolute top-3 left-3 bg-white/90 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full shadow">
                    {dest.tags[0]}
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold">{dest.name}</h3>
                <p className="text-sm text-gray-500">{dest.location}</p>
                <Link href={`/destinations/${dest.id}`}>
                  <button className="mt-3 text-user-primary font-medium hover:underline cursor-pointer">
                    Explore →
                  </button>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Show;
