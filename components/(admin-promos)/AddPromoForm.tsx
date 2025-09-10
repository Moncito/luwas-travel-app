"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/client";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { MapPin, Percent, Calendar } from "lucide-react";

const MapPickerClient = dynamic(() => import("@/components/MapPickerClient"), { ssr: false });

export default function AddPromoForm({ onAdd }: { onAdd?: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [price, setPrice] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [highlights, setHighlights] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const finalPrice =
    price && discountPercentage
      ? (Number(price) - Number(price) * (Number(discountPercentage) / 100)).toFixed(2)
      : "0.00";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (
      !title ||
      !description ||
      !discountPercentage ||
      !price ||
      !startDate ||
      !endDate ||
      !location ||
      !imageUrl ||
      !highlights ||
      latitude === null ||
      longitude === null
    ) {
      toast.error("⚠️ Please fill out all fields and select a location.");
      setLoading(false);
      return;
    }

    try {
      await addDoc(collection(db, "promos"), {
        title,
        description,
        discountPercentage: Number(discountPercentage),
        price: Number(price),
        finalPrice: Number(finalPrice),
        startDate,
        endDate,
        location,
        imageUrl,
        highlights: highlights.split(",").map((h) => h.trim()),
        latitude,
        longitude,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast.success("✅ Promo added successfully!");
      if (onAdd) onAdd();

      // reset
      setTitle("");
      setDescription("");
      setDiscountPercentage("");
      setPrice("");
      setStartDate("");
      setEndDate("");
      setLocation("");
      setImageUrl("");
      setHighlights("");
      setLatitude(null);
      setLongitude(null);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to add promo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-blue-800 mb-8 flex items-center gap-2">
        <Percent className="h-6 w-6 text-blue-600" /> Add New Promo
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
            placeholder="Location (e.g. Palawan)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
          <input
            className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
            placeholder="Image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
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
            placeholder='Highlights (comma-separated, e.g. "Day 1: Tour, Day 2: Boat Ride")'
            value={highlights}
            onChange={(e) => setHighlights(e.target.value)}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
              type="number"
              min="1"
              placeholder="Price (₱)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
            <input
              className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
              type="number"
              min="1"
              max="100"
              placeholder="Discount (%)"
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <input
              className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-4 pt-2">
            <button
              type="button"
              onClick={() => {
                setTitle("");
                setDescription("");
                setDiscountPercentage("");
                setPrice("");
                setStartDate("");
                setEndDate("");
                setLocation("");
                setImageUrl("");
                setHighlights("");
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
              {loading ? "Submitting..." : "Add Promo"}
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
            <h4 className="text-xl font-bold text-gray-800">{title || "Promo Title"}</h4>
            <p className="text-sm text-gray-500">{location || "Location"}</p>
            <p className="mt-2 text-gray-600 line-clamp-3">
              {description || "Promo description will appear here."}
            </p>
            <div className="mt-2 flex gap-2 flex-wrap">
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
            <div className="flex justify-between items-center mt-4">
              <span className="text-blue-700 font-semibold">
                {price ? `₱${price}` : "₱0.00"}
              </span>
              <span className="text-green-600 font-semibold">
                -{discountPercentage || 0}%
              </span>
            </div>
            <p className="text-blue-600 font-bold mt-1">
              Final Price: ₱{finalPrice}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {startDate || "Start Date"} → {endDate || "End Date"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
