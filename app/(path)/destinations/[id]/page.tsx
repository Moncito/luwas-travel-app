import { notFound } from "next/navigation";
import { db } from "@/firebase/admin";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import YelpSummary from "@/components/(map-reviews)/YelpSummary";
import DestinationMapClientWrapper from "@/components/(map-reviews)/DestinationMapClientWrapper";
import WeatherInsights from "@/components/(map-reviews)/WeatherInsights";
import RecommendedPlacesForDestinations from "@/components/(map-reviews)/RecommendedPlacesForDestinations";

interface Destination {
  name: string;
  title?: string;
  location: string;
  description: string;
  imageUrl: string;
  price: number;
  tags: string[];
  latitude: number;
  longitude: number;
}

interface Place {
  title: string;
  image: string;
  description: string;
  link: string;
}

export default async function DestinationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: destinationId } = await params;

  const snapshot = await db.collection("destinations").doc(destinationId).get();
  if (!snapshot.exists) return notFound();

  const rawData = snapshot.data();
  if (!rawData) return notFound(); // Safety check

  // Safely build destination
  const destination: Destination = {
    name: rawData.name || rawData.title || "Untitled Destination",
    location: rawData.location || "Unknown Location",
    description: rawData.description || "No description available.",
    imageUrl: rawData.imageUrl || "/images/fallback.jpg",
    price: rawData.price || 0,
    tags: rawData.tags || [],
    latitude: rawData.latitude || 0,
    longitude: rawData.longitude || 0,
  };

  const isDev = process.env.NODE_ENV !== "production";
  const baseUrl = isDev
    ? "http://localhost:3000"
    : process.env.NEXT_PUBLIC_SITE_URL || "https://luwas-travel.vercel.app";

  let recommendedPlaces: Place[] = [];
  try {
    const res = await fetch(
      `${baseUrl}/api/recommendations?lat=${destination.latitude}&lon=${destination.longitude}`,
      { cache: "no-store" }
    );
    const data = await res.json();
    recommendedPlaces = (data.places || []).map(
    (place: {
      title: string;
      image?: string;
      description?: string;
      link?: string;
    }) => ({
      title: place.title,
      image: place.image || "/images/fallback.jpg",
      description: place.description || "No description available.",
      link: place.link || "#",
    })
  );

  } catch (err) {
    console.error("🌐 Error fetching recommended places:", err);
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white text-black">
        {/* Hero Section */}
        <section className="relative h-[60vh]">
          <Image
            src={destination.imageUrl}
            alt={destination.name}
            fill
            priority
            className="object-cover brightness-75"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute z-10 bottom-24 left-1/2 transform -translate-x-1/2 text-center px-6">
            <h1 className="text-5xl font-bold text-white drop-shadow-lg">
              {destination.name}
            </h1>
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

        {/* Description */}
        <section className="max-w-4xl mx-auto px-6 py-16 text-center">
          <p className="text-lg text-gray-700 leading-relaxed">
            {destination.description}
          </p>
          <div className="mt-8">
            <Link
              href={`/destinations/${destinationId}/book`}
              className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition"
            >
              Book Now – ₱{destination.price.toLocaleString()}
            </Link>
          </div>
        </section>

        {/* Map */}
        <section className="max-w-4xl mx-auto px-6 pb-16">
          <h2 className="text-xl font-semibold mb-4 text-center">🗺️ Location</h2>
          <DestinationMapClientWrapper
            lat={destination.latitude}
            lon={destination.longitude}
          />
        </section>

        {/* Weather Insights */}
        <section className="max-w-4xl mx-auto px-6 pb-16">
          <WeatherInsights
            title={destination.name}
            location={destination.location}
          />
        </section>

        {/* Recommended Places */}
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <RecommendedPlacesForDestinations
            destination={destination.name}
            places={recommendedPlaces}
          />
        </section>

        {/* Yelp Summary */}
        <YelpSummary
          name={destination.name.replace(/(Trip|Itinerary|Tour)/gi, "").trim()}
          location={destination.location}
        />
      </main>

      <Footer />
    </>
  );
}
