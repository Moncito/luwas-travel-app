"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAuth } from "firebase/auth";
import {
  CalendarDays,
  MapIcon,
  PlusCircle,
  Trash2,
  Filter,
  DollarSign,
  Search,
} from "lucide-react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/firebase/client";
import { toast } from "sonner";

type Activity = {
  id: string;
  title: string;
  category?: string;
  price: number;
  durationHours?: number | null;
  dayRecommendation?: number | null;
  description?: string;
  imageUrl?: string;
  destinationId: string;
};

type Destination = {
  name: string;
  location: string;
  imageUrl?: string;
};

type ChosenActivity = Activity & { day: number };

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function CustomizeTripContent() {
  const { id: destinationId } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [destination, setDestination] = useState<Destination | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  const initialDate = searchParams.get("date") || "";
  const initialTravelers = searchParams.get("travelers") ? parseInt(searchParams.get("travelers")!) : 1;

  const [startDate, setStartDate] = useState<string>(initialDate);
  const [endDate, setEndDate] = useState<string>("");
  const [selected, setSelected] = useState<ChosenActivity[]>([]);
  const [travelers, setTravelers] = useState<number>(initialTravelers);

  // ✅ Fetch destination + activities
  useEffect(() => {
    const fetchData = async () => {
      try {
        const destRef = doc(db, "destinations", destinationId);
        const destSnap = await getDoc(destRef);
        if (destSnap.exists()) {
          const d = destSnap.data() as any;
          setDestination({
            name: d.name || "Destination",
            location: d.location || "",
            imageUrl: d.imageUrl,
          });
        }

        const qAct = query(
          collection(db, "activities"),
          where("destinationId", "==", destinationId),
          orderBy("price", "asc")
        );
        const snapshot = await getDocs(qAct);
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as any),
        })) as Activity[];
        setActivities(list);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load destination or activities.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [destinationId]);

  // 🧮 Compute day count based on date range
  const dayCount = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 0;
  }, [startDate, endDate]);

  const dayOptions = useMemo(
    () => Array.from({ length: dayCount }, (_, i) => i + 1),
    [dayCount]
  );

  const categories = useMemo(() => {
    const set = new Set<string>();
    activities.forEach((a) => a.category && set.add(a.category));
    return Array.from(set).sort();
  }, [activities]);

  // 🎯 Filter activities
  const filteredActivities = useMemo(() => {
    return activities.filter((a) => {
      const matchSearch =
        !search ||
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        (a.description || "").toLowerCase().includes(search.toLowerCase());
      const matchCategory = !categoryFilter || a.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [activities, search, categoryFilter]);

  // 💰 Compute total
  const totalPrice = useMemo(
    () => selected.reduce((sum, a) => sum + (a.price || 0), 0) * (travelers || 1),
    [selected, travelers]
  );

  const addToDay = (activity: Activity, day: number) => {
    if (!dayCount) return toast.warning("Please select your travel dates first.");
    setSelected((prev) => [...prev, { ...activity, day }]);
  };

  const removeFromPlan = (index: number) => {
    setSelected((prev) => prev.filter((_, i) => i !== index));
  };

  const clearPlan = () => setSelected([]);

  const groupedByDay = useMemo(() => {
    const map = new Map<number, ChosenActivity[]>();
    for (const a of selected) {
      if (!map.has(a.day)) map.set(a.day, []);
      map.get(a.day)!.push(a);
    }
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [selected]);

  // ✅ Proceed directly to payment
  const handleProceedToPayment = async () => {
    try {
      if (!startDate || !endDate || selected.length === 0) {
        toast.error("Please fill in all required trip details.");
        return;
      }

      const user = getAuth().currentUser;

      // 🧠 Prepare full trip data for localStorage
      const tripData = {
        tripType: "custom",
        userId: user?.uid || "guest",
        fullName: user?.displayName || "Guest User",
        email: user?.email || "guest@example.com",
        destinationId,
        destinationName: destination?.name || "Unknown Destination",
        activities: selected.map((a) => ({
          id: a.id,
          title: a.title,
          price: a.price,
          day: a.day,
        })),
        travelers,
        startDate,
        endDate,
        totalPrice,
      };

      localStorage.setItem("customTripData", JSON.stringify(tripData));

      toast.success("Trip details saved! Redirecting to payment...");
      router.push(`/destinations/${destinationId}/pay?type=custom`);
    } catch (err) {
      console.error("Error proceeding to payment:", err);
      toast.error("Failed to proceed. Please try again.");
    }
  };

  return (
    <>
      <Navbar />

      {/* 🖼️ Hero Section */}
      <section className="relative">
        <div className="relative min-h-[45vh] flex items-center justify-center text-center text-white">
          <Image
            src={destination?.imageUrl || "/images/destination-back.jpg"}
            alt={destination?.name || "Customize Trip"}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative z-10 px-6 py-16">
            <h1 className="text-4xl md:text-5xl font-extrabold">
              {destination?.name || "Customize Your Trip"}
            </h1>
            <p className="mt-3 text-gray-300 max-w-2xl mx-auto">
              {destination?.location
                ? `Plan a personalized experience in ${destination.location}`
                : "Build your own itinerary and travel your way."}
            </p>
          </div>
        </div>
      </section>

      {/* 🧱 Builder Section */}
      <main className="bg-gray-50 text-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10">
          {/* LEFT */}
          <div className="space-y-8">
            {/* Date & Travelers */}
            <div className="bg-white border rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-blue-600" />
                Trip Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                  type="date"
                  className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <input
                  type="date"
                  className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                <input
                  type="number"
                  min={1}
                  className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={travelers}
                  onChange={(e) =>
                    setTravelers(Math.max(1, Number(e.target.value)))
                  }
                />
              </div>
              {dayCount > 0 && (
                <p className="mt-3 text-sm text-gray-600">
                  Trip length: <strong>{dayCount} days</strong>
                </p>
              )}
            </div>

            {/* Filters */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      placeholder="Search activities..."
                      className="w-full border border-gray-300 rounded-xl pl-9 pr-3 py-[10px] text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="sm:w-64">
                  <label className="block text-sm text-gray-600 mb-1 flex items-center gap-1.5">
                    <Filter className="h-4 w-4 text-blue-600" />
                    Category
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-xl p-[10px] text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="">All</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Activities */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-900 tracking-tight">
                Available Activities
              </h3>

              {loading ? (
                <p className="p-6 text-gray-500 text-center">Loading activities...</p>
              ) : filteredActivities.length === 0 ? (
                <div className="p-6 border border-dashed rounded-2xl text-gray-500 text-center bg-white/60">
                  No activities found for this destination.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredActivities.map((a) => (
                    <div
                      key={a.id}
                      className="group relative bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
                    >
                      <div className="relative h-48 w-full overflow-hidden">
                        <Image
                          src={a.imageUrl || "/images/fallback.jpg"}
                          alt={a.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent" />
                      </div>

                      <div className="flex flex-col justify-between flex-1 p-5">
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                            {a.title}
                          </h4>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {a.description || "No description provided."}
                          </p>
                        </div>

                        <div className="mt-4">
                          <div className="flex justify-between text-sm text-gray-700">
                            <span className="font-medium flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-blue-600" />
                              ₱{a.price.toLocaleString()}
                            </span>
                            <span className="text-gray-500">
                              {a.durationHours ? `${a.durationHours}h` : "Flexible"}
                            </span>
                          </div>

                          <div className="mt-3 flex items-center gap-2">
                            <select
                              className="border rounded-lg p-2 flex-1 text-sm focus:ring-2 focus:ring-blue-500"
                              disabled={!dayCount}
                              defaultValue=""
                              onChange={(e) => {
                                const day = Number(e.target.value);
                                if (day) addToDay(a, day);
                                e.currentTarget.value = "";
                              }}
                            >
                              <option value="" disabled>
                                {dayCount ? "Add to day…" : "Select dates first"}
                              </option>
                              {dayOptions.map((d) => (
                                <option key={d} value={d}>
                                  Day {d}
                                </option>
                              ))}
                            </select>

                            <button
                              className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition"
                              disabled={!dayCount}
                              onClick={() => addToDay(a, a.dayRecommendation || 1)}
                            >
                              <PlusCircle className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <aside className="space-y-6 lg:sticky lg:top-8 self-start">
            <div className="bg-white border rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-blue-800 mb-3 flex items-center gap-2">
                <MapIcon className="h-5 w-5 text-blue-600" />
                Your Itinerary
              </h2>
              {selected.length === 0 ? (
                <p className="text-gray-500 text-sm">No activities added yet.</p>
              ) : (
                <>
                  {groupedByDay.map(([day, items]) => (
                    <div key={day} className="border-l-4 border-blue-600 pl-4 mb-3">
                      <h4 className="font-semibold text-blue-700 mb-1">Day {day}</h4>
                      <ul className="space-y-2">
                        {items.map((act, i) => {
                          const globalIdx = selected.findIndex(
                            (s) => s.id === act.id && s.day === act.day
                          );
                          return (
                            <li
                              key={`${act.id}-${i}`}
                              className="flex justify-between text-sm items-center"
                            >
                              <span>{act.title}</span>
                              <span className="text-gray-500">
                                ₱{act.price.toLocaleString()}
                              </span>
                              <button
                                onClick={() => removeFromPlan(globalIdx)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}

                  <button
                    onClick={clearPlan}
                    className="mt-2 text-xs text-gray-500 hover:text-red-600"
                  >
                    <Trash2 className="h-3 w-3 inline mr-1" />
                    Clear all
                  </button>
                </>
              )}
            </div>

            {/* Summary */}
            <div className="bg-white border rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Summary</h3>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Activities</span>
                <span>{selected.length}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>Travelers</span>
                <span>{travelers}</span>
              </div>
              <div className="border-t mt-4 pt-3 flex justify-between font-semibold text-blue-800">
                <span>Total</span>
                <span>₱{totalPrice.toLocaleString()}</span>
              </div>

              <button
                onClick={handleProceedToPayment}
                disabled={!startDate || !endDate || selected.length === 0}
                className="mt-5 w-full bg-blue-700 text-white py-3 rounded-lg hover:bg-blue-800 disabled:opacity-50"
              >
                Proceed to Payment
              </button>
            </div>

            <Link
              href={`/destinations/${destinationId}`}
              className="block text-center text-sm text-gray-500 hover:text-blue-700"
            >
              ← Back to trip type selection
            </Link>
          </aside>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default function CustomizeTripPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CustomizeTripContent />
    </Suspense>
  );
}
