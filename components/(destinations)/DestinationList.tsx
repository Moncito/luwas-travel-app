'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/client'; // Adjust if your Firebase client config path differs

interface Destination {
  id: string;
  name: string;
  location: string;
  tags: string[];
  description: string;
  imageUrl: string;
  price: number;
}

const itemsPerPage = 6;

export default function DestinationList({ searchTerm }: { searchTerm: string }) {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchDestinations = async () => {
      const snapshot = await getDocs(collection(db, 'destinations'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Destination[];
      setDestinations(data);
    };

    fetchDestinations();
  }, []);

  const safeSearchTerm = (searchTerm ?? '').toLowerCase();
  const filteredDestinations = destinations.filter((destination) => {
    const nameMatch = destination.name.toLowerCase().includes(safeSearchTerm);
    const locationMatch = destination.location.toLowerCase().includes(safeSearchTerm);
    const tagsMatch = destination.tags.some(tag => tag.toLowerCase().includes(safeSearchTerm));
    return nameMatch || locationMatch || tagsMatch;
  });

  const totalPages = Math.ceil(filteredDestinations.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentDestinations = filteredDestinations.slice(startIdx, startIdx + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <section className="w-full py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {filteredDestinations.length === 0 ? (
          <motion.div className="text-center text-gray-500 py-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }}>
            <p className="text-3xl mb-4">😢 No Destinations Found</p>
            <p className="text-sm">Try searching for something else.</p>
          </motion.div>
        ) : (
          <>
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ staggerChildren: 0.2 }}>
              {currentDestinations.map((destination) => (
                <Link href={`/destinations/${destination.id}`} key={destination.id}>
                  <motion.div className="relative group rounded-2xl overflow-hidden shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-500 cursor-pointer" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                    <Image src={destination.imageUrl} alt={destination.name} width={500} height={300} className="object-cover w-full h-60 group-hover:brightness-75 transition-all duration-300" />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-all duration-300" />
                    <div className="absolute top-4 right-4 bg-white text-black text-sm font-bold px-3 py-1 rounded-full shadow">
                      ₱{destination.price || '—'}
                    </div>
                    <div className="absolute bottom-0 p-6 text-white">
                      <h3 className="text-2xl font-bold">{destination.name}</h3>
                      <p className="text-sm text-gray-300">{destination.location}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {destination.tags.map((tag, idx) => (
                          <span key={idx} className="bg-white/20 rounded-full px-3 py-1 text-xs">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </motion.div>

            {/* Pagination Controls */}
            <div className="flex justify-center gap-2 mt-12">
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50">Previous</button>
              {[...Array(totalPages)].map((_, i) => (
                <button key={i + 1} onClick={() => handlePageChange(i + 1)} className={`px-4 py-2 rounded ${currentPage === i + 1 ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50">Next</button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
