'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase'; // ✅ make sure storage is exported
import { Loader2, Upload, CreditCard } from 'lucide-react';

export default function PayPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  const [user, setUser] = useState<User | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // 🔑 Auth check
  useEffect(() => {
    const auth = getAuth();
    return onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/sign-in');
      } else {
        setUser(currentUser);
      }
    });
  }, [router]);

  // 📤 Upload proof to Firebase
  const handleUpload = async () => {
    if (!file || !bookingId || !user) return;
    setLoading(true);

    try {
      // Upload file to Storage
      const proofRef = ref(storage, `proofs/${bookingId}/${file.name}`);
      await uploadBytes(proofRef, file);
      const proofUrl = await getDownloadURL(proofRef);

      // Update Firestore booking
      const bookingRef = doc(db, 'bookings', bookingId);
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

      // Redirect after success
      router.push('/travel-history'); // or /success page
    } catch (err) {
      console.error('Upload failed:', err);
      alert('❌ Failed to submit payment. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!bookingId) {
    return <p className="text-center mt-20">⚠️ Invalid booking reference.</p>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-orange-50 px-4 py-12">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <CreditCard className="w-12 h-12 text-blue-700 mx-auto mb-3" />
          <h1 className="text-2xl font-extrabold text-blue-900">Complete Your Payment</h1>
          <p className="text-gray-600 text-sm mt-1">
            Pay via GCash and upload your proof of payment.
          </p>
        </div>

        {/* QR Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 border rounded-lg shadow-sm bg-gray-50">
            <img
              src="/images/gcash-qr.jpeg"
              alt="GCash QR"
              className="w-48 h-48 object-contain"
            />
          </div>
          <p className="mt-3 text-sm text-gray-700">
            Send payment to: <span className="font-semibold text-blue-800">0977-698-0768</span>
          </p>
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-gray-800 font-medium mb-2">
            Upload Proof of Payment
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg 
                       file:border-0 file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleUpload}
          disabled={loading || !file}
          className="w-full flex items-center justify-center gap-2 bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md 
                     hover:bg-blue-800 transition disabled:opacity-50 cursor-pointer"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
          {loading ? 'Submitting...' : 'Submit Payment'}
        </button>

        {/* Note */}
        <p className="text-xs text-gray-500 text-center mt-6">
          Once submitted, your booking will be reviewed.  
          After approval, you’ll get a receipt via email.
        </p>
      </div>
    </div>
  );
}
