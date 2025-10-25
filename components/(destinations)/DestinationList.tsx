'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/client';

interface Destination {
  id: string;
  name: string;
  location: string;
  tags?: string[];
  description?: string;
  imageUrl?: string;
}

const itemsPerPage = 6;

export default function DestinationList({ searchTerm }: { searchTerm: string }) {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ Real-time Firestore sync
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'destinations'), (snapshot) => {
      const data = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Destination)
      );
      setDestinations(data);
    });

    return () => unsub(); // cleanup listener
  }, []);

  const safeSearchTerm = (searchTerm ?? '').toLowerCase();
  const filteredDestinations = destinations.filter((destination) => {
    const nameMatch = destination.name?.toLowerCase().includes(safeSearchTerm);
    const locationMatch = destination.location?.toLowerCase().includes(safeSearchTerm);
    const tagsMatch = destination.tags?.some((tag) =>
      tag.toLowerCase().includes(safeSearchTerm)
    );
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
          <div className="text-center text-gray-500 py-20">
            <p className="text-3xl mb-4">😢 No Destinations Found</p>
            <p className="text-sm">Try searching for something else.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentDestinations.map((destination) => (
                <Link href={`/destinations/${destination.id}`} key={destination.id}>
                  <div className="relative group rounded-2xl overflow-hidden shadow-lg bg-white cursor-pointer transition-all duration-300 hover:brightness-75">
                    {/* 🖼️ Image */}
                    <Image
                      src={destination.imageUrl || '/images/fallback.jpg'}
                      alt={destination.name}
                      width={500}
                      height={300}
                      unoptimized
                      className="object-cover w-full h-60 group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* 🌙 Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10 transition-all duration-300 group-hover:from-black/80" />

                    {/* 🧭 Content */}
                    <div className="absolute bottom-4 left-4 right-4 z-20 text-white">
                      <h3 className="text-xl font-bold drop-shadow-md">{destination.name}</h3>
                      <p className="text-sm text-white/90 drop-shadow">
                        {destination.location}
                      </p>
                      {destination.tags && destination.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {destination.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="bg-white/30 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* 🔢 Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-4 py-2 rounded ${
                      currentPage === i + 1
                        ? 'bg-black text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
