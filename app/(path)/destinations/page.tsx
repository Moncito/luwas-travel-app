'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DestinationHero from '@/components/(destinations)/DestinationHero';
import DestinationSearch from '@/components/(destinations)/DestinationSearch';
import DestinationList from '@/components/(destinations)/DestinationList';
import { useState } from 'react';


export default function DestinationsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div>
      <Navbar />
      <DestinationHero />
      <DestinationSearch 
        searchTerm={searchTerm}
        onSearch={(value) => setSearchTerm(value)}
      />
      <DestinationList searchTerm={searchTerm} />
      <Footer />
    </div>
  );
}
