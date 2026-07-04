'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DestinationHero from '@/components/(destinations)/DestinationHero';
import DestinationSearch from '@/components/(destinations)/DestinationSearch';
import DestinationList from '@/components/(destinations)/DestinationList';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function DestinationsContent() {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");

  // Initialize search term from URL query parameter
  useEffect(() => {
    const search = searchParams.get('search');
    if (search) {
      setSearchTerm(search);
    }
  }, [searchParams]);

  return (
    <>
      <DestinationHero />
      <DestinationSearch 
        searchTerm={searchTerm}
        onSearch={(value) => setSearchTerm(value)}
      />
      <DestinationList searchTerm={searchTerm} />
    </>
  );
}

export default function DestinationsPage() {
  return (
    <div>
      <Navbar />
      <Suspense fallback={<div>Loading...</div>}>
        <DestinationsContent />
      </Suspense>
      <Footer />
    </div>
  );
}
