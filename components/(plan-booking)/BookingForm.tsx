'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Image from 'next/image';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/client';
import { useRouter } from 'next/navigation';
import type { User } from 'firebase/auth';
import {
  Mail,
  Phone,
  Calendar,
  Home,
  Users,
  User as UserIcon,
  MapPin,
} from 'lucide-react';

interface Props {
  destinationId: string;
  user: User;
}

interface Destination {
  name: string;
  price: number;
  latitude: number;
  longitude: number;
  imageUrl?: string;
}

function IconInput({ icon: Icon, ...props }: any) {
  return (
    <div className="relative w-full">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      <input
        {...props}
        className="pl-10 pr-4 py-3 w-full rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
      />
    </div>
  );
}

export default function BookingForm({ destinationId, user }: Props) {
  const router = useRouter();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    localAddress: '',
    departureDate: '',
    returnDate: '',
    travelers: 1,
    specialRequests: '',
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.displayName || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchDestination = async () => {
      try {
        const docRef = doc(db, 'destinations', destinationId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setDestination(docSnap.data() as Destination);
        } else {
          toast.error('Destination not found.');
        }
      } catch (error) {
        toast.error('Failed to fetch destination.');
        console.error(error);
      }
    };

    fetchDestination();
  }, [destinationId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'travelers' ? Number(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination) return;
    setLoading(true);

    try {
      const totalPrice = formData.travelers * (destination.price || 0);

      // ✅ Save booking in Firestore
      const bookingRef = await addDoc(collection(db, 'bookings'), {
        ...formData,
        userId: user.uid,
        destinationId,
        totalPrice,
        status: 'pending_payment', // ⏳ Waiting for payment
        createdAt: serverTimestamp(),
        type: 'destination',
      });

      toast.success('Booking created! Redirecting to payment page...');

      // ✅ Redirect to /destinations/[id]/pay
      router.push(`/destinations/${destinationId}/pay?bookingId=${bookingRef.id}`);
    } catch (err) {
      console.error('Booking error:', err);
      toast.error('Something went wrong.');
      setLoading(false);
    }
  };

  if (!destination) return null;

  const totalPrice = formData.travelers * (destination.price || 0);
  const today = new Date().toISOString().split('T')[0];

  return (
    <section className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-orange-50 flex items-center justify-center px-4 py-12">
      <motion.div
        className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Left: Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 md:p-10 rounded-2xl shadow-2xl border border-orange-100 space-y-6"
        >
          <h2 className="text-2xl font-extrabold text-blue-800">Book Your Adventure</h2>
          <p className="text-sm text-gray-600">Fill in your details to confirm your reservation</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <IconInput icon={UserIcon} name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full Name" required />
            <IconInput icon={Mail} type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
            <IconInput icon={Phone} name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" required />
            <IconInput icon={Home} name="localAddress" value={formData.localAddress} onChange={handleChange} placeholder="Local Address" required />
            <IconInput icon={Calendar} type="date" name="departureDate" value={formData.departureDate} min={today} onChange={handleChange} required />
            <IconInput icon={Calendar} type="date" name="returnDate" value={formData.returnDate} min={today} onChange={handleChange} />
            <IconInput icon={Users} type="number" min={1} name="travelers" value={formData.travelers} onChange={handleChange} placeholder="Travelers" required />
          </div>

          <textarea
            name="specialRequests"
            value={formData.specialRequests}
            onChange={handleChange}
            placeholder="Special Requests"
            rows={3}
            className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
          />

          <div className="text-center">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-blue-700 text-white px-8 py-3 rounded-full font-bold hover:from-orange-600 hover:to-blue-800 transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Book Destination Now'}
            </button>
            <p className="text-xs text-gray-400 mt-2">You’ll pay via GCash on the next step</p>
          </div>
        </form>

        {/* Right: Destination Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-orange-100 overflow-hidden">
          {destination.imageUrl && (
            <Image
              src={destination.imageUrl}
              alt={destination.name}
              width={800}
              height={400}
              className="w-full h-56 object-cover"
            />
          )}
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-blue-900">{destination.name}</h3>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">Destination</span>
            </div>

            <div className="space-y-1 text-gray-700">
              <p>Price per person: <span className="font-semibold">₱{destination.price.toLocaleString()}</span></p>
              <p>Travelers: <span className="font-semibold">{formData.travelers}</span></p>
              <motion.p
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4 }}
                className="text-lg font-bold text-blue-900"
              >
                Total Price: ₱{totalPrice.toLocaleString()}
              </motion.p>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-blue-50 flex items-center gap-3 text-sm text-blue-800">
              <MapPin className="w-5 h-5" />
              <span>Coordinates: {destination.latitude}, {destination.longitude}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
