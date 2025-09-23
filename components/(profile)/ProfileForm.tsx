"use client";

import { useState, useEffect, useMemo } from "react";
import { auth, db } from "@/firebase/client";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const inputBase =
  "w-full h-11 px-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";
const selectBase =
  "w-full h-11 px-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none";

export default function ProfileForm() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    age: "",
    gender: "",
    address: "",
    occupation: "",
    incomeLevel: "",
  });

  const [loading, setLoading] = useState(false);

  // 🔹 Compute profile completion %
  const completion = useMemo(() => {
    const fields = Object.entries(form).filter(([key]) => key !== "email"); // email is auto-filled
    const filled = fields.filter(([, value]) => value && value.trim() !== "")
      .length;
    return Math.round((filled / fields.length) * 100);
  }, [form]);

  // 🔹 Load user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          const data = snap.data();
          setForm({
            fullName: data.fullName || "",
            email: user.email || "",
            phoneNumber: data.phoneNumber || "",
            age: data.age ? String(data.age) : "",
            gender: data.gender || "",
            address: data.address || "",
            occupation: data.occupation || "",
            incomeLevel: data.incomeLevel || "",
          });
        } else {
          setForm((p) => ({ ...p, email: user.email || "" }));
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile.");
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error("You must be logged in.");
        return;
      }

      setLoading(true);

      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        {
          ...form,
          id: user.uid,
          email: user.email,
          age: form.age ? Number(form.age) : null,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      toast.success("✅ Profile saved successfully!");
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 text-left"
    >
      {/* 🔹 Profile Completion */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Profile Completion
        </label>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all"
            style={{ width: `${completion}%` }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-1">{completion}% complete</p>
      </div>

      {/* 🔹 Personal Info */}
      <div className="rounded-xl bg-white/40 backdrop-blur-md border border-white/20 shadow-md p-6 space-y-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">
          Personal Information
        </h2>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Enter your name"
            className={inputBase}
          />
        </div>

        {/* Email (disabled) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            name="email"
            value={form.email}
            disabled
            className="w-full h-11 px-3 rounded-lg border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
            placeholder="e.g. +63 912 345 6789"
            className={inputBase}
          />
        </div>

        {/* Age & Gender */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age
            </label>
            <input
              type="number"
              name="age"
              value={form.age}
              onChange={handleChange}
              placeholder="e.g. 22"
              className={inputBase}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className={selectBase}
            >
              <option value="">Select</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="non_binary">Non-binary</option>
              <option value="prefer_not">Prefer not to say</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* 🔹 Lifestyle Info */}
      <div className="rounded-xl bg-white/40 backdrop-blur-md border border-white/20 shadow-md p-6 space-y-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">
          Lifestyle Information
        </h2>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="e.g. Manila, Philippines"
            className={inputBase}
          />
        </div>

        {/* Occupation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Occupation
          </label>
          <input
            name="occupation"
            value={form.occupation}
            onChange={handleChange}
            placeholder="e.g. Student"
            className={inputBase}
          />
        </div>

        {/* Income Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Income Level
          </label>
          <select
            name="incomeLevel"
            value={form.incomeLevel}
            onChange={handleChange}
            className={selectBase}
          >
            <option value="">Select</option>
            <option value="low">Low</option>
            <option value="mid">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      {/* 🔹 Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() =>
            setForm({
              fullName: "",
              email: form.email,
              phoneNumber: "",
              age: "",
              gender: "",
              address: "",
              occupation: "",
              incomeLevel: "",
            })
          }
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md flex items-center gap-2 transition-transform hover:scale-[1.02]"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Profile"
          )}
        </button>
      </div>
    </form>
  );
}
