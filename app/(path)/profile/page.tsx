"use client";

import ProfileForm from "@/components/(profile)/ProfileForm";
import { motion } from "framer-motion";
import { useState } from "react";
import Image from "next/image";


export default function ProfilePage() {
  const [avatar, setAvatar] = useState<string | null>(null);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* 🔹 Floating Background Blobs */}
      <motion.div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-200 opacity-50 blur-3xl"
        animate={{ x: [0, 30, -20, 0], y: [0, -20, 20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -right-40 w-[28rem] h-[28rem] rounded-full bg-indigo-300 opacity-40 blur-3xl"
        animate={{ x: [0, -25, 25, 0], y: [0, 20, -20, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 🔹 Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full text-center pt-20 pb-12 z-10"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          Welcome to Your Profile
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Keep your details up to date to enjoy a more personalized{" "}
          <span className="text-blue-600 font-semibold">LUWAS</span> travel
          experience.
        </p>

        {/* 🔹 Avatar */}
        <div className="flex justify-center mt-10 relative group">
          <div className="w-28 h-28 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-semibold shadow-lg overflow-hidden relative">
            {avatar ? (
              <Image
                src={avatar}
                alt="Profile Avatar"
                fill
                className="object-cover rounded-full"
              />
            ) : (
              <span>U</span>
            )}
          </div>

          {/* Upload overlay */}
          <label
            htmlFor="avatarUpload"
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 text-white text-sm font-medium cursor-pointer transition"
          >
            Change Photo
          </label>
          <input
            id="avatarUpload"
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </div>
      </motion.div>

      {/* 🔹 Profile Form in Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="relative w-full max-w-2xl mx-auto px-6 pb-24 z-10"
      >
        <div className="rounded-2xl bg-white/40 backdrop-blur-md border border-white/20 shadow-xl p-8">
  
          <ProfileForm />
        </div>
      </motion.div>
    </div>
  );
}
