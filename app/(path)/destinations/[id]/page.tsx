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
import AnimatedHero from "@/components/(itineraries)/AnimatedHero";
import { extractYelpName } from "@/lib/utils/yelpHelper";

interface Destination {
  name: string;
  title?: string;
  location: string;
  description: string;
  imageUrl: string;
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
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id: destinationId } = await params;
  const sp = await searchParams;
  
  // Forward searchParams (date, travelers) to the check/booking page
  const queryParts = [];
  if (sp.date) queryParts.push(`date=${sp.date}`);
  if (sp.travelers) queryParts.push(`travelers=${sp.travelers}`);
  const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";

  const snapshot = await db.collection("destinations").doc(destinationId).get();
  if (!snapshot.exists) return notFound();

  const rawData = snapshot.data();
  if (!rawData) return notFound();

  const destination: Destination = {
    name: rawData.name || rawData.title || "Untitled Destination",
    location: rawData.location || "Unknown Location",
    description: rawData.description || "No description available.",
    imageUrl: rawData.imageUrl || "/images/fallback.jpg",
    tags: rawData.tags || [],
    latitude: rawData.latitude || 0,
    longitude: rawData.longitude || 0,
  };

  const isDev = process.env.NODE_ENV !== "production";
  const baseUrl = isDev
    ? "http://localhost:3000"
    : process.env.NEXT_PUBLIC_SITE_URL || "https://luwas-travel.tours";

  let recommendedPlaces: Place[] = [];
  try {
    const res = await fetch(
      `${baseUrl}/api/recommendations?lat=${destination.latitude}&lon=${destination.longitude}`,
      { cache: "no-store" }
    );
    const data = await res.json();
    recommendedPlaces = (data.places || []).map((place: any) => ({
      title: place.title,
      image: place.image || "/images/fallback.jpg",
      description: place.description || "No description available.",
      link: place.link || "#",
    }));
  } catch (err) {
    console.error("🌐 Error fetching recommended places:", err);
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white text-gray-900">
        {/* 🌅 Hero Section */}
        <AnimatedHero
          image={destination.imageUrl}
          title={destination.name}
          location={destination.location}
        />

        {/* 📖 Main Content Section */}
        <section className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-12">
          {/* LEFT COLUMN */}
          <div className="space-y-12">
            {/* Destination Description */}
            <div className="text-center lg:text-left">
              <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line max-w-prose mx-auto lg:mx-0">
                {destination.description}
              </p>

              {/* Tags */}
              {destination.tags.length > 0 && (
                <div className="flex flex-wrap justify-center lg:justify-start gap-2 mt-5">
                  {destination.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full hover:bg-blue-700 hover:text-white transition"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Booking Button */}
              <div className="mt-8">
                <Link
                  href={`/destinations/${destinationId}/check${queryString}`}
                  className="inline-block bg-blue-700 text-white px-8 py-3 rounded-full font-medium hover:bg-white hover:text-blue-700 border border-blue-700 transition"
                >
                  Book This Destination
                </Link>
              </div>
            </div>

            {/* Traveler Reviews */}
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 text-gray-800">
                Traveler Reviews
              </h2>
              <YelpSummary
                name={extractYelpName(
                  destination.name,
                  destination.location ?? ""
                )}
                location={destination.location ?? "Philippines"}
              />
            </div>

            {/* Recommended Places */}
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                Nearby Spots
              </h2>
              <RecommendedPlacesForDestinations
                destination={destination.name}
                places={recommendedPlaces}
              />
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="space-y-8 lg:sticky lg:top-24 self-start">
            {/* Location Map */}
            {destination.latitude && destination.longitude && (
              <div className="bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold mb-3">Location</h2>
                <DestinationMapClientWrapper
                  lat={destination.latitude}
                  lon={destination.longitude}
                />
              </div>
            )}

            {/* Weather Insights */}
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold mb-3">Weather Insights</h2>
              <WeatherInsights
                title={destination.name}
                location={destination.location}
              />
            </div>
          </aside>
        </section>
      </main>

      <Footer />
    </>
  );
}
