// File: app/itineraries/[slug]/page.tsx
import { notFound } from "next/navigation";
import { db } from "@/firebase/admin";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import YelpSummary from "@/components/(map-reviews)/YelpSummary";
import RecommendedPlaces from "@/components/(map-reviews)/RecommendedPlaces";
import DestinationMapClientWrapper from "@/components/(map-reviews)/DestinationMapClientWrapper";
import WeatherInsights from "@/components/(map-reviews)/WeatherInsights";
import AnimatedHero from "@/components/(itineraries)/AnimatedHero";
import AnimatedHighlights from "@/components/(itineraries)/AnimatedHighlights";


interface Itinerary {
  title: string;
  location: string;
  description: string;
  image: string;
  price: number;
  highlights: string[];
  latitude: number;
  longitude: number;
  slug: string;
}

interface Place {
  title: string;
  description: string;
  image: string;
  link: string;
}

function extractYelpFriendlyName(title: string): string {
  return title
    .replace(/(Trip|Itinerary|Tour|Days|Nights|at|in|Package|Plan)/gi, "")
    .replace(/[^\w\s]/g, "")
    .trim()
    .split(" ")
    .filter((word) => word.length > 2)
    .slice(0, 3)
    .join(" ");
}

export default async function ItineraryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const snapshot = await db
    .collection("itineraries")
    .where("slug", "==", slug)
    .limit(1)
    .get();

  if (snapshot.empty) return notFound();

  const itinerary = snapshot.docs[0].data() as Itinerary;

  // 🌍 Fetch recommended places
  const isDev = process.env.NODE_ENV !== "production";
  const baseUrl = isDev
    ? "http://localhost:3000"
    : process.env.NEXT_PUBLIC_SITE_URL || "https://luwas-travel.vercel.app";

  let recommendedPlaces: Place[] = [];
  try {
    const recRes = await fetch(
      `${baseUrl}/api/recommendations?lat=${itinerary.latitude}&lon=${itinerary.longitude}`,
      { cache: "no-store" }
    );
    const recData = await recRes.json();
    recommendedPlaces = Array.isArray(recData.places) ? recData.places : [];
  } catch (err) {
    console.error("🌐 Error fetching recommended places:", err);
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white text-black">
        {/* Hero with animation */}
        <AnimatedHero
          image={itinerary.image}
          title={itinerary.title}
          location={itinerary.location}
        />

        {/* Content Grid */}
        <section className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-12">
            {/* Description */}
            <div className="text-center lg:text-left">
              <p className="text-lg text-gray-700 leading-relaxed">
                {itinerary.description}
              </p>
              <p className="mt-4 text-2xl font-semibold text-blue-800">
                ₱{itinerary.price?.toLocaleString()} per person
              </p>
              <div className="mt-6">
                <Link
                  href={`/itineraries/${slug}/book`}
                  className="inline-block bg-blue-700 text-white px-6 py-3 rounded-full hover:bg-white hover:text-blue-700 border border-blue-700 transition"
                >
                  Book This Itinerary
                </Link>
              </div>
            </div>

            {/* Timeline Highlights with animation */}
            {Array.isArray(itinerary.highlights) &&
              itinerary.highlights.length > 0 && (
                <AnimatedHighlights highlights={itinerary.highlights} />
              )}

            {/* Traveler Reviews */}
            <div>
              <h2 className="text-xl font-bold mb-4">Traveler Reviews</h2>
              <YelpSummary
                name={extractYelpFriendlyName(itinerary.title)}
                location={
                  itinerary.location?.includes("Manila")
                    ? "Manila"
                    : itinerary.location || "Philippines"
                }
              />
            </div>

            {/* Nearby Spots */}
            <div className="bg-gray-50 p-4 rounded-lg shadow-md">
              <h2 className="text-lg font-bold mb-3">Nearby Spots</h2>
              <RecommendedPlaces
                destination={itinerary.title}
                places={recommendedPlaces}
              />
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="space-y-8 lg:sticky lg:top-20 self-start">
            {/* Map */}
            {itinerary.latitude && itinerary.longitude && (
              <div className="bg-gray-50 p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-bold mb-3">Location</h2>
                <DestinationMapClientWrapper
                  lat={itinerary.latitude}
                  lon={itinerary.longitude}
                />
              </div>
            )}

            {/* Weather */}
            <div className="bg-gray-50 p-4 rounded-lg shadow-md">
              <h2 className="text-lg font-bold mb-3">Weather Insights</h2>
              <WeatherInsights
                title={itinerary.title}
                location={itinerary.location}
              />
            </div>
          </aside>
        </section>
      </main>

      <Footer />
    </>
  );
}
