'use client';

type DestinationSearchProps = {
  searchTerm: string;
  onSearch: (term: string) => void;
};

export default function DestinationSearch({ searchTerm, onSearch }: DestinationSearchProps) {
  return (
    <section className="w-full py-10 px-6 bg-white">
      <h1 className="flex align-center justify-center py-6 px-6 text-4xl text-bold">Find The Destination You Wanna go</h1>
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search destination, location, or tag..."
          className="w-full p-4 rounded-full border border-gray-300 focus:ring-2 focus:ring-user-primary focus:outline-none text-gray-700"
        />
      </div>
    </section>
  );
}
