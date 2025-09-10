'use client';

import AddPromoForm from '@/components/(admin-promos)/AddPromoForm';

export default function AddPromoPage() {
  return (
    <section className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold text-blue-800 mb-8 text-center">
        </h1>

        <AddPromoForm />
      </div>
    </section>
  );
}
