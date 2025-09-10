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

        {/* Description + Pricing */}
        <section className="max-w-4xl mx-auto px-6 py-16 text-center">
          <p className="text-lg leading-relaxed">{promo.description}</p>

          {/* Pricing */}
          <div className="mt-10 flex justify-center items-center gap-4">
            {promo.price > promo.finalPrice && (
              <span className="text-xl font-medium line-through text-gray-500">
                ₱{promo.price.toLocaleString()}
              </span>
            )}
            <span className="text-3xl font-bold text-black">
              ₱{promo.finalPrice.toLocaleString()}
            </span>
            {promo.discountPercentage > 0 && (
              <span className="text-base font-semibold text-red-600">
                -{promo.discountPercentage}%
              </span>
            )}
          </div>

          {promo.endDate && (
            <p className="mt-4 text-sm text-black">
              Valid until {new Date(promo.endDate).toLocaleDateString()}
            </p>
          )}

          <div className="mt-8">
            <Link
              href={`/promos/${promoId}/book`}
              className="inline-block bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-black border border-black transition"
            >
              Book This Promo
            </Link>
          </div>
        </section>

        {/* Map */}
        {promo.latitude && promo.longitude ? (
          <section className="max-w-4xl mx-auto px-6 pb-20">
            <h2 className="text-xl font-bold text-center mb-4">Location</h2>
            <DestinationMapClientWrapper lat={promo.latitude} lon={promo.longitude} />
          </section>
        ) : null}

        {/* Weather Insights */}
        <section className="max-w-4xl mx-auto px-6 pb-16">
          <h2 className="text-xl font-bold text-center mb-4"></h2>
          <WeatherInsights title={promo.title} location={promo.location} />
        </section>

        {/* Recommended Places */}
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <h2 className="text-xl font-bold text-center mb-6">Recommended Nearby</h2>
          <RecommendedPlacesForDestinations
            destination={promo.title}
            places={recommendedPlaces}
          />
        </section>

        {/* Yelp Summary */}
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <h2 className="text-xl font-bold text-center mb-6">Traveler Reviews</h2>
          <YelpSummary
            name={promo.title.replace(/(Promo|Deal|Offer)/gi, "").trim()}
            location={promo.location}
          />
        </section>
      </main>

      <Footer />
    </>
  );
}
