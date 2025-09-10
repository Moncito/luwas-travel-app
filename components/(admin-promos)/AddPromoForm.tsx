'use client';

import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/client';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

const MapPickerClient = dynamic(() => import('@/components/MapPickerClient'), { ssr: false });

export default function AddPromoForm({ onAdd }: { onAdd?: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [price, setPrice] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!title || !description || !discountPercentage || !price || !startDate || !endDate || !location || !imageUrl || latitude === null || longitude === null) {
      toast.error('⚠️ Please fill out all fields and select a location.');
      setLoading(false);
      return;
    }

    try {
      const finalPrice = Number(price) - (Number(price) * (Number(discountPercentage) / 100));

      await addDoc(collection(db, 'promos'), {
        title,
        description,
        discountPercentage: Number(discountPercentage),
        price: Number(price),
        finalPrice,
        startDate,
        endDate,
        location,
        imageUrl,
        latitude,
        longitude,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast.success('✅ Promo added successfully!');
      if (onAdd) onAdd();

      // reset
      setTitle('');
      setDescription('');
      setDiscountPercentage('');
      setPrice('');
      setStartDate('');
      setEndDate('');
      setLocation('');
      setImageUrl('');
      setLatitude(null);
      setLongitude(null);
    } catch (err) {
      console.error(err);
      toast.error('❌ Failed to add promo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-blue-800 text-center">Add New Promo</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input className="border p-2 rounded" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <input className="border p-2 rounded" placeholder="Location (e.g. Palawan)" value={location} onChange={(e) => setLocation(e.target.value)} required />
        <input className="border p-2 rounded" placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required />
        <input className="border p-2 rounded" placeholder="Discount (%)" type="number" min="1" max="100" value={discountPercentage} onChange={(e) => setDiscountPercentage(e.target.value)} required />
        <input className="border p-2 rounded" placeholder="Price (₱)" type="number" min="1" value={price} onChange={(e) => setPrice(e.target.value)} required />
        <input className="border p-2 rounded" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
        <input className="border p-2 rounded" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
      </div>

      <textarea
        className="w-full border p-2 rounded"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        required
      />

      {/* Map Picker */}
      <div className="w-full">
        <MapPickerClient
          onSelectLocation={({ lat, lng }: { lat: number; lng: number }) => {
            setLatitude(lat);
            setLongitude(lng);
          }}
        />
        {latitude !== null && longitude !== null && (
          <p className="text-green-600 text-sm mt-2">📍 Selected: {latitude.toFixed(4)}, {longitude.toFixed(4)}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800"
      >
        {loading ? 'Submitting...' : 'Add Promo'}
      </button>
    </form>
  );
}
