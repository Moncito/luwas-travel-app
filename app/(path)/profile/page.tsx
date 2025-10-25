'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { auth, db, storage } from '@/firebase/client';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { Loader2, Camera } from 'lucide-react';
import Navbar from '@/components/Navbar';
import ProfileForm from '@/components/(profile)/ProfileForm';

export default function ProfilePage() {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // 🔹 Example static data (replace with Firestore stats later)
  const tripsCompleted = 12;
  const memberSince = '2024';
  const topDestination = 'Cebu';

  // 🔹 Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          setAvatar(data.avatarUrl || null);
          setFullName(data.fullName || user.displayName || 'Traveler');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };
    fetchUser();
  }, []);

  // 🔹 Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const user = auth.currentUser;
    if (!user) {
      toast.error('Please log in to update your profile picture.');
      return;
    }

    try {
      setUploading(true);
      toast.loading('Uploading profile picture...');

      const storageRef = ref(storage, `avatars/${user.uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        avatarUrl: downloadURL,
        updatedAt: new Date().toISOString(),
      });

      setAvatar(downloadURL);
      toast.success('✅ Profile picture updated successfully!');
    } catch (err) {
      console.error('Error uploading avatar:', err);
      toast.error('❌ Failed to upload photo.');
    } finally {
      setUploading(false);
      toast.dismiss();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 relative overflow-x-hidden">
      {/* 🌐 Navbar */}
      <Navbar />

      {/* 🌊 Wave Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full h-80 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 shadow-md overflow-visible"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-blue-700/30 via-transparent to-transparent" />

        {/* Wave SVG */}
        <svg
          className="absolute bottom-0 left-0 w-full h-28"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M985.66 92.83C906.67 72 823.78 31 743.83 25.52c-81.43-5.61-147.77 27.92-228.2 33.49C436.15 65.58 349.49 41.23 266.27 30.36 175.81 18.65 87.86 26.9 0 50.87V120h1200V94.41C1123.49 111.77 1045.88 106.79 985.66 92.83z"
            fill="white"
          />
        </svg>

        {/* Avatar Section */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="absolute -bottom-24 left-1/2 transform -translate-x-1/2 z-20"
        >
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="relative group"
          >
            <div className="w-36 h-36 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white/40 backdrop-blur-md">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Profile Avatar"
                  className="w-full h-full object-cover rounded-full cursor-pointer transition-transform duration-300 hover:scale-105"
                  referrerPolicy="no-referrer"
                  onClick={() => setPreviewOpen(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-2xl font-semibold">
                  U
                </div>
              )}

              {/* Hover Overlay */}
              <label
                htmlFor="avatarUpload"
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-opacity"
              >
                {uploading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-xs">Change</span>
                  </>
                )}
              </label>
              <input
                id="avatarUpload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            {/* Soft Glow Ring */}
            <div className="absolute inset-0 rounded-full border-[3px] border-blue-300/70 animate-pulse blur-sm"></div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ✨ Profile Info Section */}
      <div className="mt-36 text-center px-4">
        <h1 className="text-3xl font-bold text-gray-900">{fullName}</h1>
        <p className="text-gray-600 mt-1">
          Keeping your profile up to date ensures a better{' '}
          <span className="text-blue-600 font-semibold">LUWAS</span> experience ✈️
        </p>

        {/* Overview Stats */}
        <div className="flex justify-center gap-8 mt-6 text-sm text-gray-600">
          <div className="text-center">
            <p className="font-semibold text-blue-600 text-lg">{tripsCompleted}</p>
            <p>Trips Completed</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-blue-600 text-lg">{memberSince}</p>
            <p>Member Since</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-blue-600 text-lg">{topDestination}</p>
            <p>Top Destination</p>
          </div>
        </div>
      </div>

      {/* 🧾 Profile Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="max-w-2xl mx-auto mt-10 px-4 pb-20"
      >
        <div className="rounded-2xl bg-white/60 backdrop-blur-md border border-blue-100 shadow-xl p-8 relative overflow-hidden">
          <ProfileForm />
        </div>
      </motion.div>

      {/* 🖼 Avatar Preview Modal */}
      {previewOpen && avatar && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setPreviewOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative"
          >
            <img
              src={avatar}
              alt="Profile Preview"
              className="max-w-sm max-h-[80vh] rounded-2xl shadow-2xl border border-white/20 object-cover"
              referrerPolicy="no-referrer"
            />
            <button
              onClick={() => setPreviewOpen(false)}
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full px-2 py-1 text-sm hover:bg-black/80 transition"
            >
              ✕
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
