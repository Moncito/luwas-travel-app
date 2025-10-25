"use client";

import { useState, useEffect } from "react";
import {
  addDoc,
  collection,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/firebase/client";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import {
  Plane,
  Calendar,
  ListChecks,
  Compass,
  PlusCircle,
  Save,
} from "lucide-react";
import ImageUploader from "./ImageUploader";

export default function AddTripPackagePanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [destinations, setDestinations] = useState<{ id: string; name: string }[]>([]);
  const [selectedDestination, setSelectedDestination] = useState("");
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [inclusions, setInclusions] = useState("");
  const [dailySchedule, setDailySchedule] = useState([{ day: 1, activities: "" }]);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // ✅ Fetch destinations
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const q = query(collection(db, "destinations"), orderBy("name"));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setDestinations(list);
      } catch (err) {
        console.error("Error fetching destinations:", err);
      }
    };
    fetchDestinations();
  }, []);

  // ✅ Fetch existing package for edit mode
  useEffect(() => {
    const fetchPackage = async () => {
      if (!editId) return;
      try {
        const docRef = doc(db, "tripPackages", editId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setSelectedDestination(data.destinationId || "");
          setTitle(data.title || "");
          setDuration(data.duration || "");
          setPrice(data.price?.toString() || "");
          setInclusions((data.inclusions || []).join(", "));
          setImageUrl(data.imageUrl || "");
          setDailySchedule(
            (data.dailySchedule || []).map((d: any, i: number) => ({
              day: d.day || i + 1,
              activities: (d.activities || []).join(", "),
            }))
          );
          setIsEditing(true);
        }
      } catch (err) {
        console.error("Error fetching package:", err);
        toast.error("❌ Failed to load package details.");
      }
    };
    fetchPackage();
  }, [editId]);

  const handleAddDay = () => {
    setDailySchedule([...dailySchedule, { day: dailySchedule.length + 1, activities: "" }]);
  };

  const handleRemoveDay = (index: number) => {
    setDailySchedule(dailySchedule.filter((_, i) => i !== index));
  };

  // ✅ Submit / Update handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!selectedDestination || !title || !duration || !price || !inclusions || !imageUrl) {
      toast.error("⚠️ Please fill out all required fields.");
      setLoading(false);
      return;
    }

    const formattedSchedule = dailySchedule.map((item) => ({
      day: item.day,
      activities: item.activities.split(",").map((a) => a.trim()),
    }));

    try {
      if (isEditing && editId) {
        // 🧾 Update existing package
        await updateDoc(doc(db, "tripPackages", editId), {
          destinationId: selectedDestination,
          title,
          duration,
          price: Number(price),
          inclusions: inclusions.split(",").map((i) => i.trim()),
          dailySchedule: formattedSchedule,
          imageUrl,
          updatedAt: serverTimestamp(),
        });
        toast.success("✅ Trip package updated successfully!");
      } else {
        // ➕ Add new package
        await addDoc(collection(db, "tripPackages"), {
          destinationId: selectedDestination,
          title,
          duration,
          price: Number(price),
          inclusions: inclusions.split(",").map((i) => i.trim()),
          dailySchedule: formattedSchedule,
          imageUrl,
          createdAt: serverTimestamp(),
        });
        toast.success("🎉 Trip package added successfully!");
      }

      // Reset or redirect
      router.push("/admin/trip-packages");
    } catch (err) {
      console.error("❌ Error saving trip package:", err);
      toast.error("Error saving trip package.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg max-w-6xl mx-auto">
      {/* Header */}
      <h2 className="text-2xl font-bold text-blue-700 mb-8 flex items-center gap-2">
        <Plane className="h-6 w-6 text-blue-600" />
        {isEditing ? "Edit Trip Package" : "Add New Trip Package"}
      </h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Destination Dropdown */}
        <div>
          <label className="block font-semibold mb-2">Select Destination</label>
          <select
            className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
            value={selectedDestination}
            onChange={(e) => setSelectedDestination(e.target.value)}
            required
          >
            <option value="">-- Choose Destination --</option>
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Trip Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Package Title (e.g. 4D3N Island Adventure)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Duration (e.g. 4 Days 3 Nights)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />
          <input
            type="number"
            className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Price (₱)"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        {/* Inclusions */}
        <div>
          <label className="block font-semibold mb-2">Inclusions</label>
          <input
            className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
            placeholder="Separate inclusions with commas (e.g. Hotel, Flight, Tour)"
            value={inclusions}
            onChange={(e) => setInclusions(e.target.value)}
            required
          />
        </div>

        {/* Daily Schedule */}
        <div>
          <label className="block font-semibold mb-2 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" /> Daily Itinerary
          </label>
          {dailySchedule.map((day, index) => (
            <div key={index} className="flex items-center gap-3 mb-3">
              <input
                type="text"
                className="border p-3 rounded-lg flex-1 focus:ring-2 focus:ring-blue-500"
                placeholder={`Day ${day.day} activities (comma-separated)`}
                value={day.activities}
                onChange={(e) => {
                  const newSchedule = [...dailySchedule];
                  newSchedule[index].activities = e.target.value;
                  setDailySchedule(newSchedule);
                }}
              />
              {dailySchedule.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveDay(index)}
                  className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddDay}
            className="mt-2 text-blue-600 text-sm hover:underline flex items-center gap-1"
          >
            <ListChecks className="h-4 w-4" /> Add Another Day
          </button>
        </div>

        {/* Image Uploader */}
        <div>
          <label className="block font-semibold mb-2">Package Image</label>
          <ImageUploader onUploadComplete={(url) => setImageUrl(url)} />
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Preview"
              className="mt-4 h-40 w-full object-cover rounded-lg border shadow-sm"
            />
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`${
              isEditing ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
            } text-white px-8 py-3 rounded-lg transition shadow flex items-center gap-2`}
          >
            {loading ? (
              "Saving..."
            ) : isEditing ? (
              <>
                <Save className="h-5 w-5" /> Save Changes
              </>
            ) : (
              <>
                <PlusCircle className="h-5 w-5" /> Add Trip Package
              </>
            )}
          </button>
        </div>
      </form>

      {/* Quick Add Section */}
      {!isEditing && (
        <div className="mt-12 border-t pt-8">
          <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Compass className="h-5 w-5 text-blue-600" /> Next Steps
          </h3>
          <p className="text-gray-500 mb-6">
            You can now create activities or view all packages linked to this destination.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Link
              href="/admin/add-activity"
              className="border-2 border-green-200 hover:border-green-400 rounded-xl p-6 flex flex-col items-center text-center hover:shadow-md transition-all"
            >
              <ListChecks className="h-10 w-10 text-green-600 mb-3" />
              <h4 className="font-semibold text-gray-800 mb-1">Add Activity</h4>
              <p className="text-gray-500 text-sm">
                Add flexible experiences that can be included in custom trip itineraries.
              </p>
              <div className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-1">
                <PlusCircle className="h-4 w-4" /> Add Activity
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
