'use client';

interface Props {
  searchTerm: string;
  onSearch: (value: string) => void;
}

export default function PromoSearch({ searchTerm, onSearch }: Props) {
  return (
    <section className="w-full py-10 px-6 bg-white">
      <h2 className="text-center text-2xl font-semibold text-gray-800 mb-6">
        Find the Promo that fits your trip
      </h2>
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search promo by title or description..."
          className="w-full p-4 rounded-full border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-700"
        />
      </div>
    </section>
  );
}
