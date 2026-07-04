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
  Trash2,
  Filter,
  DollarSign,
  Search,
  Clock,
  Heart,
  Sparkles,
  Users,
  AlertCircle,
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

const getCategoryColor = (category?: string) => {
  const map: Record<string, { badge: string; dot: string; text: string }> = {
    Adventure: {
      badge: "bg-orange-50 border-orange-200",
      dot: "bg-orange-500",
      text: "text-orange-700",
    },
    Food: {
      badge: "bg-rose-50 border-rose-200",
      dot: "bg-rose-500",
      text: "text-rose-700",
    },
    Culture: {
      badge: "bg-purple-50 border-purple-200",
      dot: "bg-purple-500",
      text: "text-purple-700",
    },
    Nature: {
      badge: "bg-emerald-50 border-emerald-200",
      dot: "bg-emerald-500",
      text: "text-emerald-700",
    },
  };

  return (
    map[category || "General"] || {
      badge: "bg-cyan-50 border-cyan-200",
      dot: "bg-cyan-500",
      text: "text-cyan-700",
    }
  );
};

function CustomizeTripContent() {
  const { id: destinationId } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [destination, setDestination] = useState<Destination | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [heroOffset, setHeroOffset] = useState(0);

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
        setLoadError(null);
        const destRef = doc(db, "destinations", destinationId);
        const destSnap = await getDoc(destRef);
        if (destSnap.exists()) {
          const d = destSnap.data() as Partial<Destination>;
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
          ...(doc.data() as Omit<Activity, "id">),
        })) as Activity[];
        setActivities(list);
      } catch (err) {
        console.error(err);
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load destination or activities.";
        setLoadError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [destinationId]);

  useEffect(() => {
    const onScroll = () => {
      const y = Math.min(window.scrollY * 0.15, 40);
      setHeroOffset(y);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

      {/* Premium Hero Section */}
      <section className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <div className="relative h-full flex items-end justify-center text-center text-white">
          <Image
            src={destination?.imageUrl || "/images/destination-back.jpg"}
            alt={destination?.name || "Customize Trip"}
            fill
            priority
            className="object-cover"
            style={{ transform: `translateY(${heroOffset}px) scale(1.06)` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-slate-900/30 to-slate-900/90" />

          <div className="relative z-10 px-6 md:px-10 pb-12 md:pb-20 w-full max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-7 text-sm text-white/70 tracking-wide">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <span className="text-white/40">/</span>
              <Link href="/destinations" className="hover:text-white transition-colors">
                Destinations
              </Link>
              <span className="text-white/40">/</span>
              <span className="text-white">{destination?.name || "Customize Trip"}</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none">
              {destination?.name || "Customize Your Trip"}
            </h1>

            <p className="mt-5 text-lg md:text-xl text-white/85 max-w-2xl font-light leading-relaxed">
              {destination?.location
                ? `Plan a personalized experience in ${destination.location}`
                : "Build your own itinerary and travel your way."}
            </p>

            <div className="mt-9 flex flex-wrap gap-4 justify-start">
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
                <MapIcon className="h-4 w-4 text-cyan-200" />
                <span className="text-white/95 text-sm">{destination?.location || "Philippines"}</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
                <Sparkles className="h-4 w-4 text-amber-200" />
                <span className="text-white/95 text-sm">20-28°C Year-Round</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
                <Users className="h-4 w-4 text-emerald-200" />
                <span className="text-white/95 text-sm">Easy Access</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Builder Section */}
      <main className="bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 text-slate-900 pb-28 lg:pb-16">
        <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 lg:grid-cols-[1fr_0.85fr] gap-12">
          {/* LEFT */}
          <div className="space-y-10">
            <div className="mb-2">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">Build Your Perfect Itinerary</h2>
              <p className="mt-2 text-slate-600">Select your dates, browse curated activities, and design each day with intention.</p>
            </div>

            {/* Date & Travelers */}
            <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <CalendarDays className="h-6 w-6 text-cyan-600" />
                Trip Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Check-in</label>
                  <input
                  type="date"
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Check-out</label>
                  <input
                  type="date"
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Travelers</label>
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                    <button
                      onClick={() => setTravelers(Math.max(1, travelers - 1))}
                      className="w-12 py-3 text-xl text-slate-600 hover:bg-slate-100 active:scale-95 transition"
                      aria-label="Decrease travelers"
                    >
                      -
                    </button>
                    <div className="flex-1 text-center py-3 font-bold text-slate-900 bg-white border-x border-slate-200">
                      {travelers}
                    </div>
                    <button
                      onClick={() => setTravelers(travelers + 1)}
                      className="w-12 py-3 text-xl text-slate-600 hover:bg-slate-100 active:scale-95 transition"
                      aria-label="Increase travelers"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              {dayCount > 0 && (
                <div className="mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 bg-cyan-50 border border-cyan-100">
                  <Clock className="h-4 w-4 text-cyan-600" />
                  <p className="text-sm text-cyan-800">
                    Trip Duration: <strong>{dayCount} days</strong>
                  </p>
                </div>
              )}
            </div>

            {/* Filters */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <input
                      placeholder="Search activities, themes, or keywords..."
                      className="w-full border border-slate-200 rounded-xl pl-10 pr-3 py-3 text-sm bg-slate-50 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="sm:w-64">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                    <Filter className="h-4 w-4 text-cyan-600" />
                    Category
                  </label>
                  <select
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-slate-50 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
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
              <div className="flex items-center justify-between">
                <h3 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">Available Experiences</h3>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                  {filteredActivities.length} results
                </span>
              </div>

              {loadError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-800">Unable to load activities</p>
                    <p className="text-sm text-red-700 mt-1">{loadError}</p>
                  </div>
                </div>
              )}

              {loading ? (
                <p className="p-8 text-slate-500 text-center bg-white border border-slate-100 rounded-2xl">Loading curated experiences...</p>
              ) : filteredActivities.length === 0 ? (
                <div className="p-10 border border-dashed border-slate-300 rounded-2xl text-slate-500 text-center bg-white">
                  No activities found for this destination.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-8">
                  {filteredActivities.map((a) => {
                    const categoryColor = getCategoryColor(a.category);

                    return (
                      <div
                        key={a.id}
                        className="group relative bg-white border border-slate-200 rounded-3xl shadow-sm hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-900/10 transition-all duration-300 overflow-hidden flex flex-col"
                      >
                        <div className="relative h-56 w-full overflow-hidden">
                          <Image
                            src={a.imageUrl || "/images/fallback.jpg"}
                            alt={a.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />

                          {a.category && (
                            <span className={`absolute top-4 left-4 inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-md bg-white/85 ${categoryColor.badge} ${categoryColor.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full mr-2 ${categoryColor.dot}`} />
                              {a.category}
                            </span>
                          )}

                          <button
                            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 border border-white/30 backdrop-blur-md hover:bg-white/90 hover:text-red-500 transition"
                            aria-label="Add activity to wishlist"
                          >
                            <Heart className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="flex flex-col justify-between flex-1 p-6">
                          <div>
                            <h4 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1">{a.title}</h4>
                            <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                              {a.description || "No description provided."}
                            </p>
                          </div>

                          <div className="mt-5 space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-semibold flex items-center gap-1 text-slate-800">
                                <DollarSign className="h-4 w-4 text-cyan-600" />
                                ₱{a.price.toLocaleString()}
                              </span>
                              <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 rounded-full px-2.5 py-1">
                                <Clock className="h-3.5 w-3.5" />
                                {a.durationHours ? `${a.durationHours}h` : "Flexible"}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <select
                                className="border border-slate-200 bg-slate-50 rounded-xl p-2.5 flex-1 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                disabled={!dayCount}
                                defaultValue=""
                                onChange={(e) => {
                                  const day = Number(e.target.value);
                                  if (day) {
                                    addToDay(a, day);
                                    toast.success(`${a.title} added to Day ${day}`);
                                  }
                                  e.currentTarget.value = "";
                                }}
                              >
                                <option value="" disabled>
                                  {dayCount ? "Add to day..." : "Select dates first"}
                                </option>
                                {dayOptions.map((d) => (
                                  <option key={d} value={d}>
                                    Day {d}
                                  </option>
                                ))}
                              </select>

                              {a.dayRecommendation && dayCount >= a.dayRecommendation && (
                                <button
                                  className="px-3 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition"
                                  onClick={() => addToDay(a, a.dayRecommendation!)}
                                >
                                  Day {a.dayRecommendation}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <aside className="space-y-6 lg:sticky lg:top-24 self-start">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <MapIcon className="h-5 w-5 text-cyan-600" />
                Your Itinerary
              </h2>

              <div className="flex flex-wrap gap-2 mb-4">
                {dayCount > 0 && (
                  <span className="inline-flex items-center rounded-full bg-cyan-50 text-cyan-700 px-3 py-1.5 text-xs font-semibold border border-cyan-100">
                    {dayCount} days
                  </span>
                )}
                <span className="inline-flex items-center rounded-full bg-purple-50 text-purple-700 px-3 py-1.5 text-xs font-semibold border border-purple-100">
                  {travelers} traveler{travelers !== 1 ? "s" : ""}
                </span>
                <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-3 py-1.5 text-xs font-semibold border border-emerald-100">
                  {selected.length} activities
                </span>
              </div>

              {selected.length === 0 ? (
                <p className="text-slate-500 text-sm">No activities added yet.</p>
              ) : (
                <>
                  <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                    {groupedByDay.map(([day, items]) => (
                      <div key={day} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <h4 className="font-semibold text-slate-800 mb-2 text-sm">Day {day}</h4>
                        <ul className="space-y-2">
                          {items.map((act, i) => {
                            const globalIdx = selected.findIndex(
                              (s) => s.id === act.id && s.day === act.day
                            );
                            return (
                              <li
                                key={`${act.id}-${i}`}
                                className="flex justify-between text-sm items-start gap-2"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="line-clamp-1 text-slate-900 font-medium">{act.title}</p>
                                  <p className="text-xs text-slate-500">₱{act.price.toLocaleString()}</p>
                                </div>
                                <button
                                  onClick={() => removeFromPlan(globalIdx)}
                                  className="text-red-500 hover:text-red-700 p-1"
                                  aria-label="Remove activity from itinerary"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={clearPlan}
                    className="mt-4 text-xs font-semibold text-slate-500 hover:text-red-600"
                  >
                    Clear all
                  </button>
                </>
              )}
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500" />

              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Pricing Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Activities</span>
                  <span>₱{selected.reduce((sum, a) => sum + (a.price || 0), 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Travelers</span>
                  <span>x{travelers}</span>
                </div>
                <div className="border-t border-slate-200 mt-3 pt-3 flex justify-between items-end">
                  <span className="font-semibold text-slate-800">Total</span>
                  <span className="text-2xl font-black bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                    ₱{totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={handleProceedToPayment}
                disabled={!startDate || !endDate || selected.length === 0}
                className="mt-5 w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-xl hover:from-cyan-600 hover:to-blue-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition"
              >
                {!startDate || !endDate
                  ? "Select Dates"
                  : selected.length === 0
                    ? "Add Activities"
                    : "Proceed to Payment"}
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6">
              <h4 className="text-sm font-bold uppercase tracking-wider text-amber-900 mb-4">Planning Guide</h4>
              <div className="space-y-3 text-sm">
                <p className="text-amber-900">1. Set dates and travelers</p>
                <p className="text-amber-900">2. Browse and filter experiences</p>
                <p className="text-amber-900">3. Assign activities per day</p>
                <p className="text-amber-900">4. Review total and checkout</p>
              </div>
            </div>

            <Link
              href={`/destinations/${destinationId}`}
              className="block text-center text-sm text-slate-500 hover:text-cyan-700"
            >
              ← Back to trip type selection
            </Link>
          </aside>
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 lg:hidden">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-slate-500">Total</p>
              <p className="text-lg font-bold text-slate-900">₱{totalPrice.toLocaleString()}</p>
            </div>
            <button
              onClick={handleProceedToPayment}
              disabled={!startDate || !endDate || selected.length === 0}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed"
            >
              View Itinerary
            </button>
          </div>
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
