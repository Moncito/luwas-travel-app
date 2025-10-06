"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { auth, db, storage } from "@/firebase/client";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";
import { Loader2, Camera } from "lucide-react";
import Image from "next/image";
import ProfileForm from "@/components/(profile)/ProfileForm";

export default function ProfilePage() {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // 🔹 Fetch user profile (avatar + name)
  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          setAvatar(data.avatarUrl || null);
          setFullName(data.fullName || user.displayName || "Traveler");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
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
      toast.error("Please log in to update your profile picture.");
      return;
    }

    try {
      setUploading(true);
      toast.loading("Uploading profile picture...");

      const storageRef = ref(storage, `avatars/${user.uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Save to Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        avatarUrl: downloadURL,
        updatedAt: new Date().toISOString(),
      });

      // Update UI instantly
      setAvatar(downloadURL);

      toast.success("✅ Profile picture updated successfully!");
    } catch (err) {
      console.error("Error uploading avatar:", err);
      toast.error("❌ Failed to upload photo.");
    } finally {
      setUploading(false);
      toast.dismiss();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* 🔹 Top Gradient Banner */}
      <div className="w-full h-64 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
        {/* Avatar Circle */}
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden">
              {avatar ? (
                // 👇 Fix for 403 visibility issue
                <img
                  src={avatar}
                  alt="Profile Avatar"
                  className="w-full h-full object-cover rounded-full cursor-pointer"
                  referrerPolicy="no-referrer"
                  onClick={() => setPreviewOpen(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-xl font-semibold">
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
          </div>
        </div>
      </div>

      {/* 🔹 Profile Name & Tagline */}
      <div className="mt-24 text-center px-4">
        <h1 className="text-3xl font-bold text-gray-900">{fullName}</h1>
        <p className="text-gray-600 mt-1">
          Keeping your profile up to date ensures a better{" "}
          <span className="text-blue-600 font-semibold">LUWAS</span> experience ✈️
        </p>
      </div>

      {/* 🔹 Profile Details Form */}
      <div className="max-w-2xl mx-auto mt-10 px-4 pb-20">
        <div className="rounded-2xl bg-white/50 backdrop-blur-md border border-white/20 shadow-xl p-8">
          <ProfileForm />
        </div>
      </div>

      {/* 🔹 Avatar Preview Modal */}
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
