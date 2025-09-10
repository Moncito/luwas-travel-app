"use client";


import ProfileForm from "@/components/(profile)/ProfileForm";
import { motion } from "framer-motion";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full text-center pt-20 pb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          Welcome to Your Profile
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Keep your details up to date to enjoy a more personalized{" "}
          <span className="text-blue-600 font-semibold">LUWAS</span> travel
          experience.
        </p>

        {/* Avatar */}
        <div className="flex justify-center mt-10">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center text-3xl font-semibold shadow-md">
            U
          </div>
        </div>
      </motion.div>

      {/* Profile Form */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="w-full max-w-2xl mx-auto px-6 pb-24"
      >
        <ProfileForm />
      </motion.div>
    </div>
  );
}
