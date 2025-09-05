'use client';

import { useEffect, useState } from 'react';
import PromoCard from './PromoCard';

interface Promo {
  id: string;
  title: string;
  description: string;
  discount: number;
  validUntil: string;
  imageUrl?: string;
}

interface Props {
  searchTerm: string;
}

export default function PromoList({ searchTerm }: Props) {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const res = await fetch('/api/promos');
        const data = await res.json();
        setPromos(data);
      } catch (err) {
        console.error('❌ Failed to load promos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPromos();
  }, []);

  const filtered = promos.filter((p) =>
    [p.title, p.description].some((field) =>
      field.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading) {
    return <p className="text-center text-gray-500 py-10">Loading promos...</p>;
  }

if (filtered.length === 0) {
  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-md mx-auto text-center bg-white border border-gray-200 rounded-2xl shadow-lg p-10">
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          No promos available
        </h3>
        <p className="text-gray-600 text-sm">
          We currently don’t have any active promotions.  
          Please check back later for new deals and discounts.
        </p>
      </div>
    </section>
  );
}


  return (
    <div className="grid gap-8 p-6 md:grid-cols-2 lg:grid-cols-3">
      {filtered.map((promo) => (
        <PromoCard key={promo.id} {...promo} />
      ))}
    </div>
  );
}
