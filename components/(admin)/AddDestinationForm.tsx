"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/client";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import Link from "next/link";
import { MapPin, UploadCloud, Compass, Plane, PlusCircle } from "lucide-react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const storage = getStorage();
const MapPickerClient = dynamic(() => import("@/components/MapPickerClient"), { ssr: false });

export default function AddDestinationPanel() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [bestSeason, setBestSeason] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 🔼 Handle image upload
  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true);
      const fileRef = ref(storage, `destinations/${Date.now()}-${file.name}`);
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

  // 🧾 Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!name || !location || !description || !tags || !imageUrl || latitude === null || longitude === null) {
      toast.error("⚠️ Please fill out all required fields and select a map location.");
      setLoading(false);
      return;
    }

    try {
      await addDoc(collection(db, "destinations"), {
        name,
        location,
        description,
        tags: tags.split(",").map((tag) => tag.trim()),
        imageUrl,
        bestSeason,
        latitude,
        longitude,
        createdAt: serverTimestamp(),
      });

      toast.success("✅ Destination added successfully!");
      setName("");
      setLocation("");
      setDescription("");
      setTags("");
      setBestSeason("");
      setImageUrl("");
      setLatitude(null);
      setLongitude(null);
    } catch (err) {
      toast.error("❌ Error adding destination.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg max-w-6xl mx-auto">
      {/* Header */}
      <h2 className="text-2xl font-bold text-blue-700 mb-8 flex items-center gap-2">
        <MapPin className="h-6 w-6 text-blue-600" /> Add New Destination
      </h2>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
              placeholder="Destination Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          {/* Tags + Best Season */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
              placeholder="Tags (comma-separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              required
            />
            <input
              className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
              placeholder="Best Season to Visit (e.g. Dec–Apr)"
              value={bestSeason}
              onChange={(e) => setBestSeason(e.target.value)}
            />
          </div>

          {/* Description */}
          <textarea
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            required
          />

          {/* Image Upload */}
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
                  id="imageUpload"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />
                <label htmlFor="imageUpload" className="text-blue-600 text-sm cursor-pointer hover:underline">
                  Browse files
                </label>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-2">
            <button
              type="button"
              onClick={() => {
                setName("");
                setLocation("");
                setDescription("");
                setTags("");
                setBestSeason("");
                setImageUrl("");
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
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition shadow"
            >
              {loading ? "Submitting..." : "Add Destination"}
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

      {/* Live Preview */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Live Preview</h3>
        <div className="border rounded-xl shadow-md overflow-hidden max-w-md">
          {imageUrl ? (
            <img src={imageUrl} alt={name} className="h-48 w-full object-cover" />
          ) : (
            <div className="h-48 w-full bg-gray-200 flex items-center justify-center text-gray-500">
              No Image Preview
            </div>
          )}
          <div className="p-4">
            <h4 className="text-xl font-bold text-gray-800">{name || "Destination Name"}</h4>
            <p className="text-sm text-gray-500">{location || "Location"}</p>
            <p className="mt-2 text-gray-600 line-clamp-3">
              {description || "Destination description will appear here."}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {tags
                ? tags.split(",").map((tag, i) => (
                    <span key={i} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                      {tag.trim()}
                    </span>
                  ))
                : <span className="text-gray-400 text-xs">#tags</span>}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Quick Add Step Cards */}
      <div className="mt-12 border-t pt-8">
        <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
          <Compass className="h-5 w-5 text-blue-600" /> Next Steps
        </h3>
        <p className="text-gray-500 mb-6">
          Now that you’ve added <strong>{name || "a destination"}</strong>, you can extend it by creating trip packages or custom activities.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link
            href="/admin/add-package"
            className="border-2 border-blue-200 hover:border-blue-400 rounded-xl p-6 flex flex-col items-center text-center hover:shadow-md transition-all"
          >
            <Plane className="h-10 w-10 text-blue-600 mb-3" />
            <h4 className="font-semibold text-gray-800 mb-1">Add Trip Package</h4>
            <p className="text-gray-500 text-sm">
              Create fixed itineraries like “3D2N Palawan Getaway” with pricing and daily schedules.
            </p>
            <div className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-1">
              <PlusCircle className="h-4 w-4" /> Add Package
            </div>
          </Link>

          <Link
            href="/admin/add-activity"
            className="border-2 border-green-200 hover:border-green-400 rounded-xl p-6 flex flex-col items-center text-center hover:shadow-md transition-all"
          >
            <MapPin className="h-10 w-10 text-green-600 mb-3" />
            <h4 className="font-semibold text-gray-800 mb-1">Add Activity</h4>
            <p className="text-gray-500 text-sm">
              Add flexible activities users can mix and match for their own custom trip plans.
            </p>
            <div className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-1">
              <PlusCircle className="h-4 w-4" /> Add Activity
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
