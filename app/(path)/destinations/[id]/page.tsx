// app/destinations/[id]/page.tsx
import { notFound } from "next/navigation";
import { db } from "@/firebase/admin";
import Image from "next/image";
import Link from "next/link";

interface Destination {
  name: string;
  location: string;
  description: string;
  imageUrl: string;
  price: number;
  tags: string[];
}

export default async function DestinationPage({ params }: { params: { id: string } }) {
  const destinationId = params.id;

  // ✅ Proper Admin SDK usage
  const snapshot = await db.collection("destinations").doc(destinationId).get();

  if (!snapshot.exists) return notFound();

  const destination = snapshot.data() as Destination;

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative h-[60vh]">
        <Image
          src={destination.imageUrl}
          alt={destination.name}
          fill
          className="object-cover brightness-75"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute z-10 bottom-24 left-1/2 transform -translate-x-1/2 text-center px-6">
          <h1 className="text-5xl font-bold text-white drop-shadow-lg">{destination.name}</h1>
          <p className="text-white/80">{destination.location}</p>
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            {destination.tags.map((tag, i) => (
              <span
                key={i}
                className="bg-white/20 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Description + Action */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <p className="text-lg text-gray-700 leading-relaxed">{destination.description}</p>

        <div className="mt-8">
          <Link
            href={`/destinations/${destinationId}/book`}
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition"
          >
            Book Now – ₱{destination.price.toLocaleString()}
          </Link>
        </div>
      </section>
    </main>
  );
}
