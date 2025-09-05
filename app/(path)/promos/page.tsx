'use client';

import { useState } from 'react';
// import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PromoHero from '@/components/(promos)/PromoHero';
import PromoSearch from '@/components/(promos)/PromoSearch';
import PromoList from '@/components/(promos)/PromoList';

export default function PromosPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div>
      {/* Shared Navbar */}
      {/* <Navbar /> */}

      {/* Hero Section */}
      <PromoHero />

      {/* Search Bar */}
      <PromoSearch 
        searchTerm={searchTerm}
        onSearch={(value) => setSearchTerm(value)}
      />

      {/* Promo List (cards) */}
      <PromoList searchTerm={searchTerm} />

      {/* Shared Footer */}
      <Footer />
    </div>
  );
}
