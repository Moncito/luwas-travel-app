"use client";

import AddItineraryForm from "@/components/(admin-itineraries)/AddItineraryForm";

export default function AdminItinerariesPage() {
  return (
    <div className="flex-1 px-6 py-12">
      <h1 className="text-3xl font-bold text-blue-800 text-center mb-10">
        Manage Itineraries
      </h1>

      {/* Just the Form, same style as Destinations */}
      <AddItineraryForm />
    </div>
  );
}
