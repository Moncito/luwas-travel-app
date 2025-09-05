'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Promo {
  id: string;
  title: string;
  description?: string;
  price: number;
  discountPercentage: number;
  finalPrice: number;
  imageUrl?: string;
}

export default function PromoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [promo, setPromo] = useState<Promo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/promos/${id}`);
        const data = await res.json();
        setPromo(data);
      } catch (err) {
        console.error('❌ Error loading promo:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <p className="text-center mt-10">Loading promo...</p>;
  if (!promo) return <p className="text-center mt-10 text-red-500">Promo not found.</p>;

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-xl shadow-md mt-10">
      {promo.imageUrl && (
        <img
          src={promo.imageUrl}
          alt={promo.title}
          className="w-full h-60 object-cover rounded-lg mb-6"
        />
      )}
      <h1 className="text-3xl font-bold text-blue-900">{promo.title}</h1>
      <p className="text-gray-700 mt-3">{promo.description}</p>

      <div className="mt-6 flex items-center gap-4">
        <span className="text-xl font-semibold line-through text-gray-400">
          ₱{promo.price}
        </span>
        <span className="text-2xl font-bold text-green-600">
          ₱{promo.finalPrice}
        </span>
        <span className="text-sm font-medium text-red-500">
          -{promo.discountPercentage}%
        </span>
      </div>

      <Link
        href={`/promos/${promo.id}/book`}
        className="mt-8 inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow transition"
      >
        Book Now
      </Link>
    </div>
  );
}
