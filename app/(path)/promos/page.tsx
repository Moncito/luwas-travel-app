'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PromoCard from '@/components/(promos)/PromoCard';

interface Promo {
  id: string;
  title: string;
  description: string;
  discountPercentage: number;
  price: number;
  finalPrice: number;
  endDate: string;
  location: string;
  imageUrl?: string;
}

export default function PromosPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'promos'));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Promo[];
        setPromos(data);
      } catch (error) {
        console.error('🔥 Error fetching promos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPromos();
  }, []);

  return (
    <main className="relative min-h-screen bg-black text-white">
      {/* 🌄 Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed opacity-80"
        style={{ backgroundImage: "url('/images/promo-background.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* 🧭 Content */}
      <div className="relative z-10 px-6 py-24">
        <Navbar />

        {/* Header Section */}
        <section className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold text-white">Special Travel Promos</h1>
          <p className="mt-4 text-lg text-white/80">
            Unlock exclusive travel deals and limited-time offers to make your next journey 
            more affordable, memorable, and exciting.
          </p>
        </section>

        {/* Cards Section */}
        {loading ? (
          <p className="text-center text-white/70">Loading promos...</p>
        ) : promos.length > 0 ? (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
            {promos.map((promo) => (
              <PromoCard key={promo.id} {...promo} />
            ))}
          </section>
        ) : (
          <div className="text-center mt-20 text-white/70">
            <p className="text-xl">🚫 No promos available at the moment.</p>
            <p className="mt-2 text-sm">
              Please check back later or contact our travel team for help.
            </p>
          </div>
        )}
      </div>

      {/* ✅ Footer Visible */}
      <div className="relative z-10 mt-16">
        <Footer />
      </div>
    </main>
  );
}
