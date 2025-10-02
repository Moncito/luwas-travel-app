// File: app/admin/edit-destination/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/client";
import { toast } from "sonner";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface FormData {
  name: string;
  location: string;
  description: string;
  imageUrl: string;
  tags: string;
  price: string;
}

const validateFormData = (formData: FormData) => {
  const errors: { [key: string]: string } = {};
  if (!formData.name) errors.name = "Name is required";
  if (!formData.location) errors.location = "Location is required";
  if (!formData.description) errors.description = "Description is required";
  if (!formData.imageUrl) errors.imageUrl = "Image is required";
  if (!formData.tags) errors.tags = "Tags are required";
  if (!formData.price || isNaN(Number(formData.price)))
    errors.price = "Invalid price";
  return errors;
};

export default function EditDestinationPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    location: "",
    description: "",
    imageUrl: "",
    tags: "",
    price: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, "destinations", id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            name: data.name || "",
            location: data.location || "",
            description: data.description || "",
            imageUrl: data.imageUrl || "",
            tags: data.tags?.join(", ") || "",
            price: String(data.price || ""),
          });
        } else {
          toast.error("Destination not found");
          router.push("/admin/destinations");
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch destination");
        router.push("/admin/destinations");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    try {
      setUploading(true);
      const storage = getStorage();
      const storageRef = ref(
        storage,
        `destinations/${id}-${Date.now()}-${file.name}`
      );
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setFormData((prev) => ({ ...prev, imageUrl: url }));
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
    const formErrors = validateFormData(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setSubmitting(true);
    try {
      const docRef = doc(db, "destinations", id as string);
      await updateDoc(docRef, {
        ...formData,
        tags: formData.tags.split(",").map((tag) => tag.trim()),
        price: Number(formData.price),
      });
      toast.success("✅ Destination updated!");
      router.push("/admin/destinations");
    } catch (err) {
      console.error(err);
      toast.error("❌ Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="p-6">Loading destination...</p>;

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg max-w-6xl mx-auto mt-10">
      <h2 className="text-2xl font-bold text-blue-700 mb-8">✏️ Edit Destination</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            className={`border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 ${
              errors.name ? "border-red-500" : ""
            }`}
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            required
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

          <input
            className={`border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 ${
              errors.location ? "border-red-500" : ""
            }`}
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Location"
            required
          />
          {errors.location && (
            <p className="text-red-500 text-sm">{errors.location}</p>
          )}

          {/* Drag and Drop Upload */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${
              uploading ? "opacity-50" : "hover:bg-gray-50"
            }`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            {uploading ? (
              <p className="text-blue-600">Uploading...</p>
            ) : formData.imageUrl ? (
              <img
                src={formData.imageUrl}
                alt="Preview"
                className="mx-auto h-40 object-cover rounded-lg"
              />
            ) : (
              <p className="text-gray-500">Drag & drop an image here</p>
            )}
          </div>
          {errors.imageUrl && (
            <p className="text-red-500 text-sm">{errors.imageUrl}</p>
          )}

          <input
            className={`border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 ${
              errors.tags ? "border-red-500" : ""
            }`}
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="Tags (comma-separated)"
            required
          />
          {errors.tags && <p className="text-red-500 text-sm">{errors.tags}</p>}

          <input
            className={`border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 ${
              errors.price ? "border-red-500" : ""
            }`}
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            placeholder="Price"
            required
          />
          {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}

          <textarea
            className={`border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 ${
              errors.description ? "border-red-500" : ""
            }`}
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            rows={4}
            required
          />
          {errors.description && (
            <p className="text-red-500 text-sm">{errors.description}</p>
          )}

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
              disabled={submitting}
              className={`bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition shadow ${
                submitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>

        {/* Right Column - Live Preview */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">
            Live Preview
          </h3>
          <div className="border rounded-xl shadow-md overflow-hidden max-w-md">
            {formData.imageUrl ? (
              <img
                src={formData.imageUrl}
                alt={formData.name}
                className="h-48 w-full object-cover"
              />
            ) : (
              <div className="h-48 w-full bg-gray-200 flex items-center justify-center text-gray-500">
                No Image Preview
              </div>
            )}
            <div className="p-4">
              <h4 className="text-xl font-bold text-gray-800">
                {formData.name || "Destination Name"}
              </h4>
              <p className="text-sm text-gray-500">
                {formData.location || "Location"}
              </p>
              <p className="mt-2 text-gray-600 line-clamp-3">
                {formData.description ||
                  "Destination description will appear here."}
              </p>
              <div className="flex justify-between items-center mt-4">
                <span className="text-blue-700 font-semibold">
                  {formData.price ? `₱${formData.price}` : "₱0.00"}
                </span>
                <div className="flex gap-2 flex-wrap">
                  {formData.tags
                    ? formData.tags.split(",").map((tag, i) => (
                        <span
                          key={i}
                          className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full"
                        >
                          {tag.trim()}
                        </span>
                      ))
                    : (
                      <span className="text-gray-400 text-xs">#tags</span>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
