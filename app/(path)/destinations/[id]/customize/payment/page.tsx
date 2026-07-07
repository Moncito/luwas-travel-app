"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAuth, onAuthStateChanged, type User } from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/client";
import { getStorage } from "firebase/storage";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2, Upload, CreditCard, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function CustomPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const bookingId = searchParams.get("bookingId");
  const tripData = searchParams.get("tripData");
  const parsedTrip = tripData ? JSON.parse(decodeURIComponent(tripData)) : null;

  const [user, setUser] = useState<User | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // 🔑 Auth guard
  useEffect(() => {
    const auth = getAuth();
    return onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) router.push("/sign-in");
      else setUser(currentUser);
    });
  }, [router]);

  // 📤 Upload payment proof
  const handleUpload = async () => {
    if (!file || !bookingId || !user) {
      toast.error("Missing booking or file information");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large (max 5MB)");
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const storage = getStorage();

      // Upload to Firebase Storage
      const proofRef = ref(
        storage,
        `proofs/custom-trips/${bookingId}/${file.name}`
      );
      const uploadTask = uploadBytesResumable(proofRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (err) => {
          console.error("❌ Upload failed:", err);
          toast.error("Upload failed. Try again.");
          setLoading(false);
        },
        async () => {
          // ✅ Get download URL after successful upload
          const proofUrl = await getDownloadURL(uploadTask.snapshot.ref);
          const bookingRef = doc(db, "bookings", bookingId);

          // ✅ Update Firestore booking
          await updateDoc(bookingRef, {
            proofUrl,
            proofFileName: file.name,
            status: "awaiting_approval",
            paidAt: serverTimestamp(),
            paidBy: {
              uid: user.uid,
              name: user.displayName || "Guest",
              email: user.email || "",
            },
          });

          toast.success("✅ Proof uploaded successfully!");
          router.push(
            `/booking-success?bookingId=${bookingId}&type=custom&destination=${encodeURIComponent(parsedTrip?.destinationName || "")}`
          );
        }
      );
    } catch (err) {
      console.error(err);
      toast.error("Upload failed. Please try again.");
      setLoading(false);
    }
  };

  if (!bookingId) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-center text-slate-600">⚠️ Invalid booking reference.</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-blue-600 rounded-full mb-4">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-3">
              Complete Your Payment
            </h1>
            <p className="text-lg text-slate-600">
              Pay via GCash and upload your proof of payment to confirm your booking
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
            {/* QR Code Section */}
            <div className="p-8 border-b border-slate-200 bg-gradient-to-br from-cyan-50 to-blue-50">
              <div className="flex flex-col items-center">
                <h2 className="text-xl font-bold text-slate-900 mb-6">
                  Scan to Pay
                </h2>

                <div className="p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-md mb-6">
                  <Image
                    src="/images/gcash-qr.jpeg"
                    alt="GCash QR"
                    width={200}
                    height={200}
                    className="object-contain"
                  />
                </div>

                <div className="text-center mb-6">
                  <p className="text-slate-600 mb-2">Send payment to:</p>
                  <p className="text-2xl font-bold text-blue-600">
                    0977-698-0768
                  </p>
                  <p className="text-sm text-slate-500 mt-2">
                    GCash Account Name: Luwas Destinations
                  </p>
                </div>

                {/* Trip Summary in Payment Section */}
                {parsedTrip && (
                  <div className="w-full bg-white rounded-2xl p-4 border border-slate-100">
                    <p className="text-xs uppercase tracking-wider font-bold text-slate-600 mb-2">
                      Amount Due
                    </p>
                    <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">
                      ₱{parsedTrip.totalPrice.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      {parsedTrip.destinationName} • {parsedTrip.activities.length} Activities
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* File Upload Section */}
            <div className="p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <Upload className="h-5 w-5 text-cyan-600" />
                Upload Proof of Payment
              </h2>

              <div className="mb-6">
                <label className="relative block">
                  <div
                    className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                      file
                        ? "border-cyan-500 bg-cyan-50"
                        : "border-slate-300 bg-slate-50 hover:border-cyan-400 hover:bg-cyan-50/50"
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => {
                        setFile(e.target.files?.[0] || null);
                        setUploadProgress(0);
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />

                    {file ? (
                      <>
                        <div className="text-cyan-600 mb-2">✅</div>
                        <p className="font-bold text-slate-900">{file.name}</p>
                        <p className="text-xs text-slate-600 mt-1">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                        <p className="font-bold text-slate-900">
                          Click to upload or drag & drop
                        </p>
                        <p className="text-xs text-slate-600 mt-1">
                          PNG, JPG or GIF (max 5MB)
                        </p>
                      </>
                    )}
                  </div>
                </label>
              </div>

              {/* Progress Bar */}
              {loading && uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-slate-900">
                      Uploading...
                    </p>
                    <p className="text-xs text-slate-600">
                      {Math.round(uploadProgress)}%
                    </p>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleUpload}
                disabled={loading || !file}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-blue-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Submit Payment Proof
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Info Note */}
              <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                <p className="text-sm text-blue-900">
                  <strong>📋 What happens next?</strong>
                </p>
                <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
                  <li>Your proof will be reviewed by our team</li>
                  <li>You&apos;ll receive email confirmation once approved</li>
                  <li>Your booking details will be finalized</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center mt-8">
            <p className="text-sm text-slate-600">
              💡 Make sure your screenshot clearly shows the transaction confirmation
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
