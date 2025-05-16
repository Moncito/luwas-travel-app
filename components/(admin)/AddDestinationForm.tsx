'use client'

import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/client';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

const MapPickerClient = dynamic(() => import('@/components/MapPickerClient'), { ssr: false });

export default function AddDestinationForm() {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!name || !location || !description || !tags || !price || !imageUrl || latitude === null || longitude === null) {
      toast.error('Please fill out all fields and select a location on the map.');
      setLoading(false);
      return;
    }

    if (!imageUrl.match(/\.(jpeg|jpg|gif|png|webp)$/)) {
      toast.error('Please enter a valid image URL ending in .jpg, .png, etc.');
      setLoading(false);
      return;
    }

    if (isNaN(Number(price)) || Number(price) <= 0) {
      toast.error('Please enter a valid price.');
      setLoading(false);
      return;
    }

    try {
      await addDoc(collection(db, 'destinations'), {
        name,
        location,
        description,
        tags: tags.split(',').map(tag => tag.trim()),
        price: Number(price),
        imageUrl,
        latitude,
        longitude,
        createdAt: serverTimestamp(),
      });

      toast.success('Destination added successfully!');
      setName('');
      setLocation('');
      setDescription('');
      setTags('');
      setPrice('');
      setImageUrl('');
      setLatitude(null);
      setLongitude(null);
    } catch (err) {
      toast.error('Error adding destination.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-xl shadow-xl max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-blue-700 mb-6 text-center">📌 Add New Destination</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input className="border p-3 rounded w-full" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input className="border p-3 rounded w-full" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} required />
        <input className="border p-3 rounded w-full" placeholder="Image URL (e.g. https://imgur.com/...)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required />
        <input className="border p-3 rounded w-full" placeholder="Tags (comma-separated)" value={tags} onChange={(e) => setTags(e.target.value)} required />
        <input className="border p-3 rounded w-full" placeholder="Price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min="0.01" step="0.01" />
      </div>

      <textarea className="w-full border p-3 rounded" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} required />

      {/* Map Picker */}
      <div className="w-full">
        <MapPickerClient
          onSelectLocation={({ lat, lng }: { lat: number; lng: number }) => {
            console.log("📍 Location selected:", lat, lng); // ✅ Fix #1
            setLatitude(lat);
            setLongitude(lng);
          }}
        />
        {/* ✅ Fix #2: Feedback message */}
        {latitude === null || longitude === null ? (
          <p className="text-red-600 text-sm mt-2">📌 Please select a location on the map.</p>
        ) : (
          <p className="text-green-600 text-sm mt-2">
            📍 Selected: {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </p>
        )}
      </div>

      <div className="text-center pt-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-8 py-3 text-lg rounded hover:bg-blue-700 transition"
        >
          {loading ? 'Submitting...' : 'Add Destination'}
        </button>
      </div>
    </form>
  );
}
