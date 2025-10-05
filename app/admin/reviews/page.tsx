'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  query,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Star, Trash2, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Review {
  id: string;
  name: string;
  title: string;
  rating: number;
  comment: string;
  type: string;
  createdAt?: { seconds: number; nanoseconds: number };
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // ───────── Fetch Reviews ─────────
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const data: Review[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Review[];
        setReviews(data);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        toast.error('Failed to fetch reviews');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  // ───────── Stats ─────────
  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0';

  const totalReviews = reviews.length;

  const positiveReviews =
    reviews.length > 0
      ? Math.round(
          (reviews.filter((r) => r.rating >= 4).length / reviews.length) * 100
        )
      : 0;

  // ───────── Filtering Logic ─────────
  const filtered = reviews.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery) ||
      r.title.toLowerCase().includes(searchQuery);
    const matchesType = filterType ? r.type === filterType : true;
    return matchesSearch && matchesType;
  });

  // ───────── Delete Review ─────────
  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      await deleteDoc(doc(db, 'reviews', selectedId));
      setReviews((prev) => prev.filter((r) => r.id !== selectedId));
      toast.success('🗑️ Review deleted successfully');
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    } finally {
      setShowConfirm(false);
      setSelectedId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-6">
      <h1 className="text-3xl font-bold text-blue-800 mb-8 text-center">
        Reviews Management 🌴
      </h1>

      {/* ───────── Analytics Cards ───────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-md border border-blue-100 p-5 text-center">
          <p className="text-gray-500 text-sm">Average Rating</p>
          <p className="text-3xl font-bold text-blue-800 mt-1">{averageRating} ★</p>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-blue-100 p-5 text-center">
          <p className="text-gray-500 text-sm">Total Reviews</p>
          <p className="text-3xl font-bold text-blue-800 mt-1">{totalReviews}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-blue-100 p-5 text-center">
          <p className="text-gray-500 text-sm">Positive Reviews</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{positiveReviews}%</p>
        </div>
      </div>

      {/* ───────── Filter/Search Bar ───────── */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-5">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="text-blue-700 w-5 h-5" />
          <select
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          >
            <option value="">All Types</option>
            <option value="booking">Booking</option>
            <option value="promo">Promo</option>
            <option value="itinerary">Itinerary</option>
          </select>
        </div>

        <input
          type="text"
          placeholder="Search traveler or trip..."
          className="w-full sm:w-64 px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
        />
      </div>

      {/* ───────── Table ───────── */}
      {loading ? (
        <p className="text-center text-gray-500">Loading reviews...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <img
            src="/illustrations/empty-box.svg"
            alt="Empty"
            className="w-40 mx-auto mb-3 opacity-80"
          />
          <p className="text-gray-500">No reviews found.</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="overflow-x-auto bg-white shadow-xl rounded-2xl border border-blue-100"
        >
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-blue-700 text-white">
              <tr>
                <th className="py-3 px-4 text-left">Traveler</th>
                <th className="py-3 px-4 text-left">Trip Title</th>
                <th className="py-3 px-4 text-center">Rating</th>
                <th className="py-3 px-4 text-left">Comment</th>
                <th className="py-3 px-4 text-center">Type</th>
                <th className="py-3 px-4 text-center">Date</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((review) => (
                <tr
                  key={review.id}
                  className="border-b hover:bg-blue-50 transition"
                >
                  <td className="py-3 px-4 font-medium text-blue-900">
                    {review.name || 'Traveler'}
                  </td>
                  <td className="py-3 px-4">{review.title || '—'}</td>
                  <td className="py-3 px-4 text-center">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="inline text-yellow-400 w-4 h-4 star-animate"
                      />
                    ))}
                  </td>
                  <td className="py-3 px-4 text-gray-700 truncate max-w-xs">
                    {review.comment || 'No comment'}
                  </td>
                  <td className="py-3 px-4 text-center capitalize">
                    {review.type || 'booking'}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-500">
                    {review.createdAt?.seconds
                      ? new Date(
                          review.createdAt.seconds * 1000
                        ).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => {
                        setSelectedId(review.id);
                        setShowConfirm(true);
                      }}
                      className="text-red-500 hover:text-red-700 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* ───────── Delete Confirmation Modal ───────── */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded-2xl shadow-lg text-center max-w-sm mx-3"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <h2 className="text-xl font-semibold text-blue-800 mb-2">
                Delete Review?
              </h2>
              <p className="text-gray-600 mb-5">
                Are you sure you want to remove this review? This action cannot
                be undone.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
