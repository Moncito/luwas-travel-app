// File: app/promos/[id]/page.tsx
import { notFound } from "next/navigation";
import { db } from "@/firebase/admin";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DestinationMapClientWrapper from "@/components/(map-reviews)/DestinationMapClientWrapper";
import WeatherInsights from "@/components/(map-reviews)/WeatherInsights";
import RecommendedPlacesForDestinations from "@/components/(map-reviews)/RecommendedPlacesForDestinations";
import YelpSummary from "@/components/(map-reviews)/YelpSummary";
import { extractYelpName, extractYelpLocation } from "@/lib/utils/yelpHelper";


interface Promo {
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  finalPrice: number;
  startDate?: string;
  endDate?: string;
  location: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  highlights?: string[];
}

interface Place {
  title: string;
  image: string;
  description: string;
  link: string;
}

export default async function PromoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: promoId } = await params;

  // 🔎 Fetch promo data
  const snapshot = await db.collection("promos").doc(promoId).get();
  if (!snapshot.exists) return notFound();

  const rawData = snapshot.data();
  if (!rawData) return notFound();

  const promo: Promo = {
    title: rawData.title || "Untitled Promo",
    description: rawData.description || "No description available.",
    price: rawData.price || 0,
    discountPercentage: rawData.discountPercentage || 0,
    finalPrice: rawData.finalPrice || rawData.price || 0,
    startDate: rawData.startDate,
    endDate: rawData.endDate,
    location: rawData.location || "Unknown Location",
    imageUrl: rawData.imageUrl || "/images/fallback.jpg",
    latitude: rawData.latitude || 0,
    longitude: rawData.longitude || 0,
    highlights: rawData.highlights || [],
  };

  const isDev = process.env.NODE_ENV !== "production";
  const baseUrl = isDev
    ? "http://localhost:3000"
    : process.env.NEXT_PUBLIC_SITE_URL || "https://luwas-travel.vercel.app";

  let recommendedPlaces: Place[] = [];
  try {
    const res = await fetch(
      `${baseUrl}/api/recommendations?lat=${promo.latitude}&lon=${promo.longitude}`,
      { cache: "no-store" }
    );
    const data = await res.json();
    recommendedPlaces = Array.isArray(data.places)
      ? data.places.map((place: any) => ({
          title: place.title,
          image: place.image || "/images/fallback.jpg",
          description: place.description || "No description available.",
          link: place.link || "#",
        }))
      : [];
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
            src={promo.imageUrl}
            alt={promo.title}
            fill
            priority
            className="object-cover brightness-75"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute z-10 bottom-24 left-1/2 -translate-x-1/2 text-center px-6">
            <h1 className="text-5xl font-bold text-white drop-shadow-lg">
              {promo.title}
            </h1>
            <p className="text-white/80 text-lg">{promo.location}</p>
          </div>
        </section>

        {/* Grid Layout */}
        <section className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-10">
            {/* Description & Pricing */}
            <div className="text-center lg:text-left">
              <p
              className="text-lg text-gray-700 leading-relaxed whitespace-pre-line max-w-prose mx-auto lg:mx-0"
            >
              {promo.description}
            </p>


              <div className="mt-6 flex flex-wrap justify-center lg:justify-start items-center gap-4">
                {promo.price > promo.finalPrice && (
                  <span className="text-xl font-medium line-through text-gray-500">
                    ₱{promo.price.toLocaleString()}
                  </span>
                )}
                <span className="text-3xl font-bold text-blue-800">
                  ₱{promo.finalPrice.toLocaleString()}
                </span>
                {promo.discountPercentage > 0 && (
                  <span className="text-base font-semibold text-red-600">
                    -{promo.discountPercentage}%
                  </span>
                )}
              </div>

              {promo.endDate && (
                <p className="mt-3 text-sm text-gray-600">
                  Valid until {new Date(promo.endDate).toLocaleDateString()}
                </p>
              )}

              <div className="mt-6">
                <Link
                  href={`/promos/${promoId}/book`}
                  className="inline-block bg-blue-700 text-white px-6 py-3 rounded-full hover:bg-white hover:text-blue-700 border border-blue-700 transition"
                >
                  Book This Promo
                </Link>
              </div>
            </div>

            {/* Highlights Timeline */}
            {Array.isArray(promo.highlights) && promo.highlights.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-6">Promo Highlights</h2>
                <div className="relative border-l-2 border-blue-500 pl-8 space-y-8">
                  {promo.highlights.map((item, idx) => (
                    <div key={idx} className="relative pl-4">
                      <span className="absolute -left-[1.05rem] top-2 h-4 w-4 rounded-full bg-blue-600 border-2 border-white shadow-md" />
                      <h3 className="text-blue-700 font-bold text-lg mb-1">
                        Highlight {idx + 1}
                      </h3>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Traveler Reviews */}
            {/* Traveler Reviews */}
            <div className="bg-gray-50 p-4 rounded-lg shadow-md">
              <h2 className="text-lg font-bold mb-3">Traveler Reviews</h2>
              <YelpSummary
                name={extractYelpName(promo.title, promo.location)}
                location={extractYelpLocation(promo.location)}
              />
            </div>

            {/* Nearby Spots */}
            <div className="bg-gray-50 p-4 rounded-lg shadow-md">
              <h2 className="text-lg font-bold mb-3">Nearby Spots</h2>
              <RecommendedPlacesForDestinations
                destination={promo.title}
                places={recommendedPlaces}
              />
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="space-y-8 lg:sticky lg:top-20 self-start">
            {promo.latitude && promo.longitude && (
              <div className="bg-gray-50 p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-bold mb-3">Location</h2>
                <DestinationMapClientWrapper
                  lat={promo.latitude}
                  lon={promo.longitude}
                />
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg shadow-md">
              <h2 className="text-lg font-bold mb-3">Weather Insights</h2>
              <WeatherInsights title={promo.title} location={promo.location} />
            </div>
          </aside>
        </section>
      </main>

      <Footer />
    </>
  );
}
