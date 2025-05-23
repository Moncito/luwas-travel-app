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

export default async function ItineraryPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await Promise.resolve(params);

  const snapshot = await db
    .collection("itineraries")
    .where("slug", "==", slug)
    .limit(1)
    .get();

  if (snapshot.empty) return notFound();

  const itinerary = snapshot.docs[0].data() as Itinerary;

  const isDev = process.env.NODE_ENV !== "production";
  const baseUrl = isDev
    ? "http://localhost:3000"
    : process.env.NEXT_PUBLIC_SITE_URL || "https://luwas-travel.vercel.app";

  let recommendedPlaces: any[] = [];
  try {
    const recRes = await fetch(
      `${baseUrl}/api/recommendations?lat=${itinerary.latitude}&lon=${itinerary.longitude}`,
      { cache: "no-store" }
    );
    const recData = await recRes.json();
    recommendedPlaces = recData.places || [];
  } catch (err) {
    console.error("🌐 Error fetching recommended places:", err);
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white text-black">
        {/* Hero */}
        <section className="relative h-[60vh]">
          <Image
            src={itinerary.image}
            alt={itinerary.title}
            fill
            className="object-cover brightness-75"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute z-10 bottom-24 left-1/2 transform -translate-x-1/2 text-center px-6">
            <h1 className="text-5xl font-bold text-white drop-shadow-lg">
              {itinerary.title}
            </h1>
            <p className="text-white/80">{itinerary.location}</p>
          </div>
        </section>

        {/* Description */}
        <section className="max-w-4xl mx-auto px-6 py-16 text-center">
          <p className="text-lg text-gray-700 leading-relaxed">
            {itinerary.description}
          </p>
          <p className="mt-4 text-xl font-semibold">
            ₱{itinerary.price?.toLocaleString()} per person
          </p>
          <div className="mt-6">
            <Link
              href={`/itineraries/${slug}/book`}
              className="inline-block bg-black text-white px-6 py-3 rounded-full hover:bg-white hover:text-black border hover:border-black transition"
            >
              Book This Itinerary
            </Link>
          </div>
        </section>

        {/* Map */}
        {itinerary.latitude && itinerary.longitude && (
          <section className="max-w-4xl mx-auto px-6 pb-20">
            <h2 className="text-xl font-bold text-center mb-4">Location</h2>
            <DestinationMapClientWrapper
              lat={itinerary.latitude}
              lon={itinerary.longitude}
            />
          </section>
        )}

        {/* Highlights */}
        {Array.isArray(itinerary.highlights) && (
          <section className="max-w-4xl mx-auto px-6 pb-16">
            <h2 className="text-xl font-bold text-center mb-4">
              Daily Highlights
            </h2>
            <ul className="space-y-3 text-gray-800">
              {itinerary.highlights.map((item: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="h-2 w-2 mt-2 rounded-full bg-black" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Weather */}
        <WeatherInsights
          title={itinerary.title}
          location={itinerary.location}
        />

        {/* Recommendations */}
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <RecommendedPlaces
            destination={itinerary.title}
            places={recommendedPlaces}
          />
        </section>

        {/* ✅ Yelp Summary */}
        <YelpSummary
          name={itinerary.title.replace(/(Trip|Itinerary|Tour)/gi, '').trim()}
          location={itinerary.location}
        />
      </main>
      <Footer />
    </>
  );
}
