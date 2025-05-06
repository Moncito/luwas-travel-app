// File: app/admin/edit-destination/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/client';
import { toast } from 'sonner';

interface FormData {
  name: string;
  location: string;
  description: string;
  imageUrl: string;
  tags: string;
  price: string;
}

const validateFormData = (formData: FormData) => {
  const errors: { [key: string]: string } = {};

  if (!formData.name) errors.name = 'Name is required';
  if (!formData.location) errors.location = 'Location is required';
  if (!formData.description) errors.description = 'Description is required';
  if (!formData.imageUrl || !formData.imageUrl.startsWith('http')) errors.imageUrl = 'Invalid image URL';
  if (!formData.tags) errors.tags = 'Tags are required';
  if (!formData.price || isNaN(Number(formData.price))) errors.price = 'Invalid price';

  return errors;
};

export default function EditDestinationPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    location: '',
    description: '',
    imageUrl: '',
    tags: '',
    price: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, 'destinations', id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            name: data.name || '',
            location: data.location || '',
            description: data.description || '',
            imageUrl: data.imageUrl || '',
            tags: data.tags?.join(', ') || '',
            price: data.price || '',
          });
        } else {
          toast.error('Destination not found');
          router.push('/admin/trips');
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to fetch destination');
        router.push('/admin/trips');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formErrors = validateFormData(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    setSubmitting(true);
    try {
      const docRef = doc(db, 'destinations', id as string);
      await updateDoc(docRef, {
        ...formData,
        tags: formData.tags.split(',').map((tag) => tag.trim()),
        price: Number(formData.price),
      });
      toast.success('Destination updated!');
      router.push('/admin/trips');
    } catch (err) {
      console.error(err);
      toast.error('Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mt-10 space-y-6 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold text-blue-700 mb-4">Edit Destination</h2>
      <input
        className={`w-full border p-2 rounded ${errors.name ? 'border-red-500' : ''}`}
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Name"
        required
      />
      {errors.name && <p className="text-red-500">{errors.name}</p>}
      <input
        className={`w-full border p-2 rounded ${errors.location ? 'border-red-500' : ''}`}
        name="location"
        value={formData.location}
        onChange={handleChange}
        placeholder="Location"
        required
      />
      {errors.location && <p className="text-red-500">{errors.location}</p>}
      <input
        className={`w-full border p-2 rounded ${errors.imageUrl ? 'border-red-500' : ''}`}
        name="imageUrl"
        value={formData.imageUrl}
        onChange={handleChange}
        placeholder="Image URL"
        required
      />
      {errors.imageUrl && <p className="text-red-500">{errors.imageUrl}</p>}
      <input
        className={`w-full border p-2 rounded ${errors.tags ? 'border-red-500' : ''}`}
        name="tags"
        value={formData.tags}
        onChange={handleChange}
        placeholder="Tags (comma-separated)"
        required
      />
      {errors.tags && <p className="text-red-500">{errors.tags}</p>}
      <input
        className={`w-full border p-2 rounded ${errors.price ? 'border-red-500' : ''}`}
        name="price"
        type="number"
        value={formData.price}
        onChange={handleChange}
        placeholder="Price"
        required
      />
      {errors.price && <p className="text-red-500">{errors.price}</p>}
      <textarea
        className={`w-full border p-2 rounded ${errors.description ? 'border-red-500' : ''}`}
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Description"
        rows={4}
        required
      />
      {errors.description && <p className="text-red-500">{errors.description}</p>}
      <button
        type="submit"
        className={`bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={submitting}
      >
        {submitting ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}