'use client';

import { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/firebase/client';
import { toast } from 'sonner';
import { serverTimestamp } from 'firebase/firestore';


export default function AddDestinationForm() {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate input fields
    if (!name || !location || !description || !tags || !price || !imageUrl) {
      toast.error('Please fill out all fields.');
      setLoading(false);
      return;
    }

    // Validate image URL
    if (!imageUrl.match(/\.(jpeg|jpg|gif|png|webp)$/)) {
      toast.error('Please enter a valid image URL ending in .jpg, .png, etc.');
      setLoading(false);
      return;
    }

    // Validate price
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
        createdAt: serverTimestamp(), // ✅ Add this line
      });


      toast.success('Destination added successfully!');
      // Reset form fields
      setName('');
      setLocation('');
      setDescription('');
      setTags('');
      setPrice('');
      setImageUrl('');
    } catch (err) {
      toast.error('Error adding destination.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-blue-700 mb-4">Add New Destination</h2>

      <input
        className="w-full border p-2 rounded"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <input
        className="w-full border p-2 rounded"
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        required
      />

      <input
        className="w-full border p-2 rounded"
        placeholder="Image URL (e.g. https://imgur.com/...)"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        required
      />

      <input
        className="w-full border p-2 rounded"
        placeholder="Tags (comma-separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        required
      />

      <input
        className="w-full border p-2 rounded"
        placeholder="Price"
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
        min="0.01"
        step="0.01"
      />

      <textarea
        className="w-full border p-2 rounded"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        {loading ? 'Submitting...' : 'Add Destination'}
      </button>
    </form>
  );
}