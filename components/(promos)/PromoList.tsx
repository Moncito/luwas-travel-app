'use client';

import { useEffect, useState } from 'react';
import PromoCard from './PromoCard';

interface Promo {
  id: string;
  title: string;
  description: string;
  discountPercentage: number;
  price: number;
  finalPrice: number;
  startDate: string;
  endDate: string;
  location: string;
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
    return (
      <p className="text-center text-gray-600">Loading promos...</p>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="text-center mt-20 text-black/70">
        <p className="text-xl font-semibold">🚫 No promos available at the moment.</p>
        <p className="mt-2 text-sm">Please check back later or contact our travel team for help.</p>
      </div>
    );
  }

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
      {filtered.map((promo) => (
        <PromoCard key={promo.id} {...promo} />
      ))}
    </section>
  );
}
