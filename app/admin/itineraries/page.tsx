"use client";

import AddItineraryForm from "@/components/(admin-itineraries)/AddItineraryForm";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function AdminItinerariesPage() {
  const [itineraries, setItineraries] = useState<any[]>([]);

  const fetchItineraries = async () => {
    const querySnapshot = await getDocs(collection(db, "itineraries"));
    const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setItineraries(data);
  };

  useEffect(() => {
    fetchItineraries();
  }, []);

  return (
    <div className="flex-1 px-6 py-12 max-w-4xl mx-auto space-y-12">
      <h1 className="text-3xl font-bold text-blue-800 text-center">Manage Itineraries</h1>

      {/* Centered Form */}
      <div className="flex justify-center">
        <AddItineraryForm onAdd={fetchItineraries} />
      </div>

      {/* Itinerary List Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-blue-700 text-center">Existing Itineraries</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {itineraries.map((itinerary) => (
            <div
              key={itinerary.id}
              className="bg-white border border-blue-100 rounded-xl shadow-md p-5 hover:shadow-lg transition"
            >
              <h3 className="text-lg font-bold text-blue-800">{itinerary.title}</h3>
              <p className="text-sm text-gray-500 italic">/{itinerary.slug}</p>
              <p className="mt-2 text-gray-700 text-sm">{itinerary.description}</p>
              <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
                {itinerary.highlights?.slice(0, 3).map((h: string, idx: number) => (
                  <li key={idx}>{h}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
