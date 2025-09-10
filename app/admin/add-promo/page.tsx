"use client";

import AddPromoForm from "@/components/(admin-promos)/AddPromoForm";

export default function AdminPromosPage() {
  return (
    <div className="flex-1 px-6 py-12">
      <h1 className="text-3xl font-bold text-blue-800 text-center mb-10">
        Manage Promos
      </h1>

      {/* Form only, same style as destinations */}
      <AddPromoForm />
    </div>
  );
}
