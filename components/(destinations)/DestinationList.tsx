'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

const destinations = [
  {
    id: 1,
    name: 'Boracay Island',
    location: 'Aklan, Philippines',
    tags: ['Beach', 'Luxury'],
    description: 'Powdery white sands and vibrant nightlife await you.',
    imageUrl: '/images/boracay.png',
  },
  {
    id: 2,
    name: 'Banaue Rice Terraces',
    location: 'Ifugao, Philippines',
    tags: ['Adventure', 'Heritage'],
    description: 'Marvel at the 2,000-year-old hand-carved mountains.',
    imageUrl: '/images/banaue.png',
  },
  {
    id: 3,
    name: 'El Nido',
    location: 'Palawan, Philippines',
    tags: ['Beach', 'Adventure'],
    description: 'Secret lagoons, limestone cliffs, paradise waters.',
    imageUrl: '/images/elnido.png',
  },
];

type DestinationListProps = {
  searchTerm: string;
};

export default function DestinationList({ searchTerm }: DestinationListProps) {
  const safeSearchTerm = (searchTerm ?? '').toLowerCase();

  const filteredDestinations = destinations.filter((destination) => {
    const nameMatch = destination.name.toLowerCase().includes(safeSearchTerm);
    const locationMatch = destination.location.toLowerCase().includes(safeSearchTerm);
    const tagsMatch = destination.tags.some(tag =>
      tag.toLowerCase().includes(safeSearchTerm)
    );

    return nameMatch || locationMatch || tagsMatch;
  });

  return (
    <section className="w-full py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">

        {filteredDestinations.length === 0 ? (
          <motion.div
            className="text-center text-gray-500 py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-3xl mb-4">😢 No Destinations Found</p>
            <p className="text-sm">Try searching for a beach, adventure, or city!</p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ staggerChildren: 0.2 }}
          >
            {filteredDestinations.map((destination) => (
              <Link href={`/destinations/${destination.id}`} key={destination.id}>
                <motion.div
                  className="relative group rounded-2xl overflow-hidden shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-500 cursor-pointer"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7 }}
                >
                  <Image
                    src={destination.imageUrl}
                    alt={destination.name}
                    width={500}
                    height={300}
                    className="object-cover w-full h-60 group-hover:brightness-75 transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-all duration-300" />
                  <div className="absolute bottom-0 p-6 text-white">
                    <h3 className="text-2xl font-bold">{destination.name}</h3>
                    <p className="text-sm text-gray-300">{destination.location}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {destination.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-white/20 rounded-full px-3 py-1 text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
