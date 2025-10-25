'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/client';
import ItineraryCard from '@/components/(itineraries)/ItineraryCard';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

// Data interface
interface Itinerary {
  id: string;
  slug: string;
  title: string;
  image: string;
  duration: string;
  highlights: string[];
  price?: number | string;
}

export default function ItinerariesPage() {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from Firestore
  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'itineraries'));
        const data = snapshot.docs.map((doc) => {
          const info = doc.data();
          return {
            id: doc.id,
            slug: info.slug || '',
            title: info.title || 'Untitled Itinerary',
            image: info.image || '/images/default-itinerary.jpg',
            duration: info.duration || 'Flexible Duration',
            highlights: info.highlights || [],
            price: info.price ?? 0,
          };
        });
        setItineraries(data);
      } catch (error) {
        console.error('🔥 Error fetching itineraries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItineraries();
  }, []);

  return (
    <main className="relative min-h-screen bg-black text-white">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed opacity-80"
        style={{ backgroundImage: "url('/images/itinerary-background.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 py-24">
        <Navbar />

        {/* Header */}
        <section className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold text-white">
            Discover Pre-Planned Adventures Across the Philippines
          </h1>
          <p className="mt-4 text-lg text-white/80">
            Browse our selection of fully-planned itineraries — from island escapes to cultural journeys.
            No stress, just pack and go.
          </p>
        </section>

        {/* Itinerary Cards */}
        {loading ? (
          <p className="text-center text-white/70">Loading itineraries...</p>
        ) : itineraries.length > 0 ? (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
            {itineraries.map((trip) => (
              <ItineraryCard
                key={trip.id}
                slug={trip.slug}
                title={trip.title}
                imageUrl={trip.image}
                duration={trip.duration}
                highlights={trip.highlights}
                price={trip.price}
              />
            ))}
          </section>
        ) : (
          <div className="text-center mt-20 text-white/70">
            <p className="text-xl">🚫 No itineraries available at the moment.</p>
            <p className="mt-2 text-sm">Please check back later or contact our travel team for help.</p>
          </div>
        )}
      </div>

      {/* ✅ Footer Fixed & Visible */}
      <div className="relative z-10 mt-16">
        <Footer />
      </div>
    </main>
  );
}
