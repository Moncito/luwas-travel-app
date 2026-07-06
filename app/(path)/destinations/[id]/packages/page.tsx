import { db } from "@/firebase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CalendarDays, MapPin, Tag } from "lucide-react";
import Image from "next/image";

interface TripPackage {
  id: string;
  title: string;
  duration: string;
  price: number;
  inclusions: string[];
  dailySchedule: { day: number; activities: string[] }[];
  imageUrl?: string;
  packageLocation?: string;
  destinationLocation?: string;
}

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ place?: string | string[] }>;
}

export default async function TripPackagesPage({ params, searchParams }: Props) {
  const { id: destinationId } = await params;
  const sp = await searchParams;
  const selectedPlaceRaw = Array.isArray(sp.place) ? sp.place[0] : sp.place;
  const selectedPlace = (selectedPlaceRaw || "").trim();

  const destinationSnap = await db.collection("destinations").doc(destinationId).get();
  if (!destinationSnap.exists) return notFound();

  const destinationLocation = destinationSnap.exists ? destinationSnap.data()?.location || "" : "";

  const snapshot = await db
    .collection("tripPackages")
    .where("destinationId", "==", destinationId)
    .orderBy("price", "asc")
    .get();

  const packages: TripPackage[] = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title,
      duration: data.duration,
      price: data.price,
      inclusions: data.inclusions,
      dailySchedule: data.dailySchedule,
      imageUrl: data.imageUrl || "/images/destination-back.jpg",
      packageLocation: data.packageLocation,
      destinationLocation: data.destinationLocation || destinationLocation,
    };
  });

  const normalizedPlace = selectedPlace.toLowerCase();
  const filteredPackages = normalizedPlace
    ? packages.filter((pkg) => (pkg.packageLocation || pkg.destinationLocation || "").toLowerCase().includes(normalizedPlace))
    : packages;

  const availablePlaces = Array.from(
    new Set(
      packages
        .map((pkg) => pkg.packageLocation || pkg.destinationLocation || "")
        .map((p) => p.trim())
        .filter(Boolean)
    )
  );

  return (
    <>
      <Navbar />

      {/* 🌴 Full-Page Background Layer */}
      <div className="relative min-h-screen text-gray-900 ">
        <Image
          src="/images/destbackid.jpg"
          alt="Destination Background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center z-0 "
        />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

        <main className="relative z-10">
          {/* 🏔 Header */}
          <header className="text-center py-28 px-6 text-white max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              Choose Your Trip Package
            </h1>
            <p className="text-gray-200 text-base md:text-lg">
              Pick from our curated travel packages — from adventurous getaways to relaxing escapes.
              Every package includes carefully selected experiences to make your trip unforgettable.
            </p>

            {selectedPlace && (
              <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm text-white">
                <MapPin className="h-4 w-4" />
                Showing packages near: {selectedPlace}
              </p>
            )}
          </header>

          {availablePlaces.length > 0 && (
            <section className="px-6 pb-2">
              <div className="max-w-7xl mx-auto flex flex-wrap gap-2">
                <Link
                  href={`/destinations/${destinationId}/packages`}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    !selectedPlace
                      ? "bg-blue-700 text-white"
                      : "bg-white/90 text-blue-800 hover:bg-white"
                  }`}
                >
                  All Places
                </Link>
                {availablePlaces.map((place) => (
                  <Link
                    key={place}
                    href={`/destinations/${destinationId}/packages?place=${encodeURIComponent(place)}`}
                    className={`rounded-full px-4 py-2 text-sm transition ${
                      selectedPlace.toLowerCase() === place.toLowerCase()
                        ? "bg-blue-700 text-white"
                        : "bg-white/90 text-blue-800 hover:bg-white"
                    }`}
                  >
                    {place}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 📦 Package Cards */}
          <section className=" py-20 px-6">
            {filteredPackages.length > 0 ? (
              <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                {filteredPackages.map((pkg) => (
                <Link
                  key={pkg.id}
                  href={`/destinations/${destinationId}/packages/${pkg.id}`}
                  className="group relative bg-white/90 backdrop-blur-md border border-gray-200 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative h-52 w-full">
                    <Image
                      src={pkg.imageUrl!}
                      alt={pkg.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
                    <div className="absolute bottom-3 left-3 text-white text-sm font-semibold bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                      <CalendarDays className="inline h-4 w-4 mr-1 text-yellow-300" />
                      {pkg.duration}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-3">
                    <h2 className="text-xl font-bold text-blue-900 group-hover:text-blue-700 line-clamp-1">
                      {pkg.title}
                    </h2>
                    <p className="text-blue-700 text-sm flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {pkg.packageLocation || pkg.destinationLocation || "Destination area"}
                    </p>

                    <p className="text-gray-700 text-sm line-clamp-2">
                      {pkg.inclusions?.slice(0, 2).join(", ")}{" "}
                      {pkg.inclusions?.length > 2 && "and more..."}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      <span className="text-2xl font-semibold text-blue-800">
                        ₱{pkg.price.toLocaleString()}
                      </span>
                      <Tag className="text-blue-600 h-5 w-5" />
                    </div>

                    <div className="mt-4">
                      <span className="inline-block bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-medium group-hover:bg-blue-800 transition">
                        View Package →
                      </span>
                    </div>
                  </div>

                  {/* Hover border accent */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500 rounded-2xl transition-all duration-300 pointer-events-none" />
                </Link>
                ))}
              </div>
            ) : (
              <div className="max-w-3xl mx-auto rounded-2xl border border-white/30 bg-white/20 backdrop-blur-md p-10 text-center text-white">
                <h2 className="text-2xl font-bold mb-3">No Packages Yet For This Place</h2>
                <p className="text-gray-100 mb-6">
                  {selectedPlace
                    ? `We do not have a package for ${selectedPlace} yet. Try another place or view all packages for this destination.`
                    : "We do not have published packages for this destination yet. Please check back soon."}
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link
                    href={`/destinations/${destinationId}/packages`}
                    className="rounded-full bg-white px-5 py-2 text-sm font-medium text-blue-800 hover:bg-blue-50 transition"
                  >
                    View All Packages
                  </Link>
                  <Link
                    href={`/destinations/${destinationId}/check`}
                    className="rounded-full bg-blue-700 px-5 py-2 text-sm font-medium text-white hover:bg-blue-800 transition"
                  >
                    Back To Trip Options
                  </Link>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>

      <Footer />
    </>
  );
}
