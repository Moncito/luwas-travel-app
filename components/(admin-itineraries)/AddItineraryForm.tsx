"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/client";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { MapPin, UploadCloud } from "lucide-react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const storage = getStorage();
const MapPickerClient = dynamic(() => import("@/components/MapPickerClient"), { ssr: false });

export default function AddItineraryForm({ onAdd }: { onAdd?: () => void }) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [location, setLocation] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [highlights, setHighlights] = useState("");
  const [price, setPrice] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 🔼 Handle file upload to Firebase Storage (itineraries folder)
  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true);
      const fileRef = ref(storage, `itineraries/${Date.now()}-${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      setImageUrl(url);
      toast.success("✅ Image uploaded successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("❌ Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (
      !title ||
      !slug ||
      !imageUrl ||
      !location ||
      !duration ||
      !description ||
      !highlights ||
      !price ||
      latitude === null ||
      longitude === null
    ) {
      toast.error("⚠️ Please fill out all fields and select a location.");
      setLoading(false);
      return;
    }

    try {
      await addDoc(collection(db, "itineraries"), {
        title,
        slug,
        imageUrl,
        location,
        duration,
        description,
        highlights: highlights.split(",").map((h) => h.trim()),
        price: Number(price),
        latitude,
        longitude,
        createdAt: serverTimestamp(),
      });

      toast.success("✅ Itinerary added successfully!");
      if (onAdd) onAdd();

      // Reset form
      setTitle("");
      setSlug("");
      setImageUrl("");
      setLocation("");
      setDuration("");
      setDescription("");
      setHighlights("");
      setPrice("");
      setLatitude(null);
      setLongitude(null);
    } catch (err) {
      toast.error("❌ Error saving itinerary.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-blue-800 mb-8 flex items-center gap-2">
        <MapPin className="h-6 w-6 text-blue-700" /> Add New Itinerary
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
            placeholder="Slug (e.g. palawan-escape)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />

          {/* Drag & Drop Upload */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files.length > 0) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
          >
            {uploading ? (
              <p className="text-blue-600">Uploading...</p>
            ) : imageUrl ? (
              <img src={imageUrl} alt="Uploaded preview" className="h-40 w-full object-cover rounded-md" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-500">
                <UploadCloud className="h-8 w-8" />
                <p>Drag & drop image here, or click to select</p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="itineraryUpload"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />
                <label htmlFor="itineraryUpload" className="text-blue-600 text-sm cursor-pointer hover:underline">
                  Browse files
                </label>
              </div>
            )}
          </div>

          <input
            className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
            placeholder="Location (e.g. Palawan)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
          <input
            className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
            placeholder="Duration (e.g. 3 days, 2 nights)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />
          <textarea
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            required
          />
          <input
            className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
            placeholder="Highlights (comma-separated)"
            value={highlights}
            onChange={(e) => setHighlights(e.target.value)}
            required
          />
          <input
            className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />

          <div className="flex justify-end gap-4 pt-2">
            <button
              type="button"
              onClick={() => {
                setTitle("");
                setSlug("");
                setImageUrl("");
                setLocation("");
                setDuration("");
                setDescription("");
                setHighlights("");
                setPrice("");
                setLatitude(null);
                setLongitude(null);
              }}
              className="bg-gray-200 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-700 text-white px-8 py-3 rounded-lg hover:bg-blue-800 transition shadow"
            >
              {loading ? "Submitting..." : "Add Itinerary"}
            </button>
          </div>
        </form>

        {/* Right Column - Map Picker */}
        <div className="space-y-4">
          <MapPickerClient
            onSelectLocation={({ lat, lng }: { lat: number; lng: number }) => {
              setLatitude(lat);
              setLongitude(lng);
            }}
          />
          {latitude === null || longitude === null ? (
            <p className="text-red-600 text-sm">📌 Please select a location on the map.</p>
          ) : (
            <p className="text-green-600 text-sm">
              📍 Selected: {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </p>
          )}
        </div>
      </div>

      {/* Live Preview Card */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Live Preview</h3>
        <div className="border rounded-xl shadow-md overflow-hidden max-w-md">
          {imageUrl ? (
            <img src={imageUrl} alt={title} className="h-48 w-full object-cover" />
          ) : (
            <div className="h-48 w-full bg-gray-200 flex items-center justify-center text-gray-500">
              No Image Preview
            </div>
          )}
          <div className="p-4">
            <h4 className="text-xl font-bold text-gray-800">{title || "Itinerary Title"}</h4>
            <p className="text-sm text-gray-500">{location || "Location"}</p>
            <p className="text-gray-600 text-sm mt-1">{duration || "Duration"}</p>
            <p className="mt-2 text-gray-600 line-clamp-3">
              {description || "Itinerary description will appear here."}
            </p>
            <div className="flex justify-between items-center mt-4">
              <span className="text-blue-700 font-semibold">
                {price ? `₱${price}` : "₱0.00"}
              </span>
              <div className="flex gap-2 flex-wrap">
                {highlights
                  ? highlights.split(",").map((h, i) => (
                      <span
                        key={i}
                        className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full"
                      >
                        {h.trim()}
                      </span>
                    ))
                  : <span className="text-gray-400 text-xs">#highlights</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
