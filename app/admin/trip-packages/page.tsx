'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Pencil, Plane, MapPin, PlusCircle, X } from 'lucide-react';

// ---------------- TYPES ---------------- //
interface TripPackage {
  id: string;
  destinationId: string;
  title: string;
  duration: string;
  price: number;
  inclusions: string[];
  imageUrl?: string;
}

interface Destination {
  id: string;
  name: string;
}

// ---------------- DELETE MODAL ---------------- //
function DeleteModal({
  show,
  onClose,
  onConfirm,
  pkgTitle,
  pkgImage,
}: {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pkgTitle: string;
  pkgImage?: string;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-xl p-8 w-[90%] max-w-md text-center relative"
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 30 }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            {pkgImage && (
              <img
                src={pkgImage}
                alt={pkgTitle}
                className="h-32 w-full object-cover rounded-lg mb-4"
              />
            )}
            <Trash2 className="mx-auto text-red-500 h-8 w-8 mb-3" />
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Delete "{pkgTitle}"?
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              This action cannot be undone. The package will be permanently removed.
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
              >
                Delete Permanently
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------------- MAIN COMPONENT ---------------- //
export default function TripPackagesAdminPage() {
  const [packages, setPackages] = useState<TripPackage[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<TripPackage | null>(null);

  // ✅ Fetch trip packages
  const fetchPackages = async () => {
    const snapshot = await getDocs(collection(db, 'tripPackages'));
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as TripPackage[];
    setPackages(data);
  };

  // ✅ Fetch destinations for linking names
  const fetchDestinations = async () => {
    const snapshot = await getDocs(collection(db, 'destinations'));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
    })) as Destination[];
    setDestinations(data);
  };

  useEffect(() => {
    fetchPackages();
    fetchDestinations();
  }, []);

  // ✅ Get destination name by ID
  const getDestinationName = (id: string) => {
    const dest = destinations.find((d) => d.id === id);
    return dest ? dest.name : 'Unknown Destination';
  };

  // 🗑️ Handle delete package
  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'tripPackages', id));
    toast.success('🗑️ Package deleted successfully!');
    fetchPackages();
  };

  return (
    <section className="min-h-screen bg-white px-8 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-bold text-blue-800 flex items-center gap-2">
            <Plane className="text-blue-600" /> Trip Packages
          </h1>
          <Link
            href="/admin/add-package"
            className="flex items-center gap-2 bg-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800 transition"
          >
            <PlusCircle size={18} /> Add Package
          </Link>
        </div>

        {/* Packages Grid */}
        {packages.length === 0 ? (
          <p className="text-center text-gray-500 py-24">
            😕 No trip packages yet. Click “Add Package” to create one.
          </p>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {packages.map((pkg) => (
              <motion.div
                key={pkg.id}
                className="bg-white border rounded-2xl shadow-sm overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
              >
                {pkg.imageUrl && (
                  <Image
                    src={pkg.imageUrl}
                    alt={pkg.title}
                    width={400}
                    height={200}
                    className="object-cover w-full h-48"
                  />
                )}

                <div className="p-5 space-y-2">
                  <h3 className="text-lg font-bold text-blue-800">{pkg.title}</h3>
                  <p className="text-sm text-gray-600">Duration: {pkg.duration}</p>
                  <p className="text-sm font-semibold text-green-700">
                    ₱{pkg.price.toLocaleString()}
                  </p>

                  {/* Destination Tag */}
                  <div className="mt-2 flex items-center gap-1 text-xs text-blue-600">
                    <MapPin size={12} />
                    <span>{getDestinationName(pkg.destinationId)}</span>
                  </div>

                  {/* Inclusions */}
                  <p className="text-xs text-gray-500">
                    {pkg.inclusions.slice(0, 3).join(', ')}...
                  </p>

                  {/* Buttons */}
                  <div className="flex justify-between items-center mt-4">
                    <Link
                      href={`/admin/add-package?edit=${pkg.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                    >
                      <Pencil size={15} /> Edit
                    </Link>
                    <button
                      onClick={() => {
                        setSelectedPackage(pkg);
                        setShowDelete(true);
                      }}
                      className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                    >
                      <Trash2 size={15} /> Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* 🗑️ Delete Modal */}
      <DeleteModal
        show={showDelete}
        pkgTitle={selectedPackage?.title || ''}
        pkgImage={selectedPackage?.imageUrl}
        onClose={() => setShowDelete(false)}
        onConfirm={() => {
          if (selectedPackage) {
            handleDelete(selectedPackage.id);
            setShowDelete(false);
          }
        }}
      />
    </section>
  );
}
