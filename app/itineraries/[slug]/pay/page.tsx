'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { Loader2, Upload, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

export default function DestinationPayPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const title = searchParams.get('title') || '';

  const [user, setUser] = useState<User | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // 🔑 Auth guard
  useEffect(() => {
    const auth = getAuth();
    return onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) router.push('/sign-in');
      else setUser(currentUser);
    });
  }, [router]);

  const handleUpload = async () => {
    if (!file || !bookingId || !user) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large (max 5MB)');
      return;
    }

    setLoading(true);
    try {
      const proofRef = ref(storage, `proofs/destinations/${bookingId}/${file.name}`);
      const uploadTask = uploadBytesResumable(proofRef, file);

      uploadTask.on(
        'state_changed',
        undefined,
        (err) => {
          console.error('❌ Upload failed:', err);
          toast.error('Upload failed. Try again.');
          setLoading(false);
        },
        async () => {
          const proofUrl = await getDownloadURL(uploadTask.snapshot.ref);
          const bookingRef = doc(db, 'promoBookings', bookingId);
          router.push(`/booking-success?type=promo&title=${encodeURIComponent(title)}`);



          await updateDoc(bookingRef, {
            proofUrl,
            status: 'awaiting_approval',
            paidAt: serverTimestamp(),
            paidBy: {
              uid: user.uid,
              name: user.displayName || 'Guest',
              email: user.email || '',
            },
          });

          toast.success('Proof uploaded successfully!');
          router.push(`/booking-success?type=destination&title=${encodeURIComponent(title)}`);
        }
      );
    } catch (err) {
      console.error(err);
      toast.error('Upload failed. Please try again.');
      setLoading(false);
    }
  };

  if (!bookingId) return <p className="text-center mt-20">⚠️ Invalid booking reference.</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-orange-50 px-4 py-12">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg">
        <div className="text-center mb-8">
          <CreditCard className="w-12 h-12 text-blue-700 mx-auto mb-3" />
          <h1 className="text-2xl font-extrabold text-blue-900">Complete Your Payment</h1>
          <p className="text-gray-600 text-sm mt-1">
            Pay via GCash and upload your proof of payment.
          </p>
        </div>

        <div className="flex flex-col items-center mb-6">
          <div className="p-3 border rounded-lg shadow-sm bg-gray-50">
            <img src="/images/gcash-qr.jpeg" alt="GCash QR" className="w-48 h-48 object-contain" />
          </div>
          <p className="mt-3 text-sm text-gray-700">
            Send payment to: <span className="font-semibold text-blue-800">0977-698-0768</span>
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-gray-800 font-medium mb-2">
            Upload Proof of Payment
          </label>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg 
                       file:border-0 file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={loading || !file}
          className="w-full flex items-center justify-center gap-2 bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md 
                     hover:bg-blue-800 transition disabled:opacity-50 cursor-pointer"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
          {loading ? 'Submitting...' : 'Submit Payment'}
        </button>

        <p className="text-xs text-gray-500 text-center mt-6">
          Once submitted, your booking will be reviewed.
          After approval, you’ll get a receipt via email.
        </p>
      </div>
    </div>
  );
}
