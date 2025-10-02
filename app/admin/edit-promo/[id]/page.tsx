"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/client";
import { toast } from "sonner";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface Promo {
  title: string;
  description: string;
  discountPercentage: number;
  price: number;
  finalPrice: number;
  imageUrl: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  highlights?: string[];
}

export default function EditPromoPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState<Promo>({
    title: "",
    description: "",
    discountPercentage: 0,
    price: 0,
    finalPrice: 0,
    imageUrl: "",
    location: "",
    startDate: "",
    endDate: "",
    highlights: [],
  });

  useEffect(() => {
    const fetchPromo = async () => {
      try {
        const docRef = doc(db, "promos", id as string);
        const snap = await getDoc(docRef);

        if (!snap.exists()) {
          toast.error("Promo not found");
          router.push("/admin/promos");
          return;
        }

        const data = snap.data() as Promo;
        setForm({
          ...data,
          highlights: data.highlights || [],
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load promo");
        router.push("/admin/promos");
      } finally {
        setLoading(false);
      }
    };

    fetchPromo();
  }, [id, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Drag & Drop Image Upload
  const handleImageUpload = async (file: File) => {
    if (!file) return;
    try {
      setUploading(true);
      const storage = getStorage();
      const storageRef = ref(storage, `promos/${id}-${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setForm((prev) => ({ ...prev, imageUrl: url }));
      toast.success("✅ Image uploaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const docRef = doc(db, "promos", id as string);
      const price = Number(form.price);
      const discountPercentage = Number(form.discountPercentage);
      const finalPrice = price - price * (discountPercentage / 100);

      await updateDoc(docRef, {
        ...form,
        price,
        discountPercentage,
        finalPrice,
        highlights: form.highlights || [],
      });

      toast.success("✅ Promo updated!");
      router.push("/admin/promos");
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to update promo");
    }
  };

  if (loading) return <p className="p-6">Loading promo details...</p>;

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg max-w-6xl mx-auto mt-10">
      <h2 className="text-2xl font-bold text-blue-700 mb-8">✏️ Edit Promo</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Title"
            required
          />
          <input
            className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Location (optional)"
          />

          {/* Drag & Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${
              uploading ? "opacity-50" : "hover:bg-gray-50"
            }`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            {uploading ? (
              <p className="text-blue-600">Uploading...</p>
            ) : form.imageUrl ? (
              <img
                src={form.imageUrl}
                alt="Promo"
                className="mx-auto h-40 object-cover rounded-lg"
              />
            ) : (
              <p className="text-gray-500">Drag & drop an image here</p>
            )}
          </div>

          <textarea
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            rows={3}
            required
          />
          <input
            className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
            name="highlights"
            value={form.highlights?.join(", ") || ""}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                highlights: e.target.value.split(",").map((h) => h.trim()),
              }))
            }
            placeholder='Highlights (comma-separated, e.g. "Day 1: Tour, Day 2: Boat Ride")'
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="Price"
              required
            />
            <input
              className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
              type="number"
              name="discountPercentage"
              value={form.discountPercentage}
              onChange={handleChange}
              placeholder="Discount (%)"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
              type="date"
              name="startDate"
              value={form.startDate || ""}
              onChange={handleChange}
            />
            <input
              className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
              type="date"
              name="endDate"
              value={form.endDate || ""}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end gap-4 pt-2">
            <button
              type="button"
              onClick={() => router.push("/admin/trips")}
              className="bg-gray-200 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-700 text-white px-8 py-3 rounded-lg hover:bg-blue-800 transition shadow"
            >
              Save Changes
            </button>
          </div>
        </form>

        {/* Right Column - Live Preview */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Live Preview</h3>
          <div className="border rounded-xl shadow-md overflow-hidden max-w-md">
            {form.imageUrl ? (
              <img
                src={form.imageUrl}
                alt={form.title}
                className="h-48 w-full object-cover"
              />
            ) : (
              <div className="h-48 w-full bg-gray-200 flex items-center justify-center text-gray-500">
                No Image Preview
              </div>
            )}
            <div className="p-4">
              <h4 className="text-xl font-bold text-gray-800">
                {form.title || "Promo Title"}
              </h4>
              <p className="text-sm text-gray-500">
                {form.location || "Location"}
              </p>
              <p className="mt-2 text-gray-600 line-clamp-3">
                {form.description || "Promo description will appear here."}
              </p>
              <div className="mt-2 flex gap-2 flex-wrap">
                {form.highlights?.length
                  ? form.highlights.map((h, i) => (
                      <span
                        key={i}
                        className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full"
                      >
                        {h}
                      </span>
                    ))
                  : (
                    <span className="text-gray-400 text-xs">#highlights</span>
                  )}
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-blue-700 font-semibold">
                  ₱{form.price || 0}
                </span>
                <span className="text-green-600 font-semibold">
                  -{form.discountPercentage || 0}%
                </span>
              </div>
              <p className="text-blue-600 font-bold mt-1">
                Final Price: ₱
                {form.price && form.discountPercentage
                  ? (
                      Number(form.price) -
                      Number(form.price) *
                        (Number(form.discountPercentage) / 100)
                    ).toFixed(2)
                  : "0.00"}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {form.startDate || "Start Date"} → {form.endDate || "End Date"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
