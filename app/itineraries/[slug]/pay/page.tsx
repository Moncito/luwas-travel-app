'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db, storage } from '@/lib/firebase'
import { Loader2, Upload, CreditCard } from 'lucide-react'

export default function ItineraryPayPage() {
  const router = useRouter()
  const { slug } = useParams()
  const searchParams = useSearchParams()

  const bookingId = searchParams.get('bookingId')
  const title = searchParams.get('title') || 'Itinerary'

  const [user, setUser] = useState<User | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  // 🔑 Auth check
  useEffect(() => {
    const auth = getAuth()
    return onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) router.push('/sign-in')
      else setUser(currentUser)
    })
  }, [router])

  // 📤 Upload proof
  const handleUpload = async () => {
    if (!file || !bookingId || !user) return
    setLoading(true)
    try {
      const proofRef = ref(storage, `proofs/${bookingId}/${file.name}`)
      await uploadBytes(proofRef, file)
      const proofUrl = await getDownloadURL(proofRef)

      const bookingRef = doc(db, 'itineraryBookings', bookingId)
      await updateDoc(bookingRef, {
        proofUrl,
        status: 'awaiting_approval',
        paidAt: serverTimestamp(),
        paidBy: {
          uid: user.uid,
          name: user.displayName || 'Guest',
          email: user.email || '',
        },
      })

      router.push(`/booking-success?type=itinerary&title=${encodeURIComponent(title)}`)
    } catch (err) {
      console.error('Upload failed:', err)
      alert('❌ Failed to submit payment. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!bookingId) {
    return <p className="text-center mt-20">⚠️ Invalid booking reference.</p>
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 px-4 py-12">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg">
        <div className="text-center mb-8">
          <CreditCard className="w-12 h-12 text-indigo-700 mx-auto mb-3" />
          <h1 className="text-2xl font-extrabold text-indigo-900">Complete Itinerary Payment</h1>
          <p className="text-gray-600 text-sm mt-1">
            Pay via GCash and upload your proof of payment for this itinerary.
          </p>
        </div>

        <div className="flex flex-col items-center mb-6">
          <div className="p-3 border rounded-lg shadow-sm bg-gray-50">
            <img src="/images/gcash-qr.jpeg" alt="GCash QR" className="w-48 h-48 object-contain" />
          </div>
          <p className="mt-3 text-sm text-gray-700">
            Send payment to: <span className="font-semibold text-indigo-800">0977-698-0768</span>
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-gray-800 font-medium mb-2">Upload Proof of Payment</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg 
              file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={loading || !file}
          className="w-full flex items-center justify-center gap-2 bg-indigo-700 text-white font-semibold py-3 rounded-lg shadow-md 
            hover:bg-indigo-800 transition disabled:opacity-50 cursor-pointer"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
          {loading ? 'Submitting...' : 'Submit Payment'}
        </button>
      </div>
    </div>
  )
}
