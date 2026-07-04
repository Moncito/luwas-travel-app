'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import gsap from 'gsap';
import { collection, onSnapshot } from 'firebase/firestore';
import { Calendar, History, MapPin, Minus, Plus, Search, Sparkles, Users } from 'lucide-react';
import { db } from '@/firebase/client';

interface Destination {
  id: string;
  name: string;
  location: string;
  tags?: string[];
  imageUrl?: string;
}

export default function HeroSearchWidget() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [query, setQuery] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [departureDate, setDepartureDate] = useState('');
  const [travelers, setTravelers] = useState(1);
  const [recentDestinationIds, setRecentDestinationIds] = useState<string[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'destinations'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Destination[];
      setDestinations(data);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const stored = window.localStorage.getItem('luwas-recent-destination-ids');
    if (!stored) {
      return;
    }
    try {
      const parsed = JSON.parse(stored) as string[];
      if (Array.isArray(parsed)) {
        setRecentDestinationIds(parsed.slice(0, 4));
      }
    } catch {
      setRecentDestinationIds([]);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setShowDropdown(false);
        setShowRecommendations(false);
        setPanelOpen(false);
        if (rootRef.current) {
          gsap.to(rootRef.current, {
            '--focus-progress': 0,
            duration: 0.25,
            ease: 'power2.out',
          } as gsap.TweenVars);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!panelRef.current) {
      return;
    }

    if (panelOpen) {
      gsap.killTweensOf(panelRef.current);
      gsap.set(panelRef.current, { display: 'block' });
      gsap.to(panelRef.current, {
        height: 'auto',
        opacity: 1,
        duration: 0.35,
        ease: 'power2.out',
      });
      return;
    }

    gsap.killTweensOf(panelRef.current);
    gsap.to(panelRef.current, {
      height: 0,
      opacity: 0,
      duration: 0.25,
      ease: 'power2.inOut',
      onComplete: () => {
        if (panelRef.current) {
          gsap.set(panelRef.current, { display: 'none' });
        }
      },
    });
  }, [panelOpen]);

  const filteredDestinations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return [];
    }

    return destinations
      .filter(
        (destination) =>
          destination.name?.toLowerCase().includes(normalizedQuery) ||
          destination.location?.toLowerCase().includes(normalizedQuery) ||
          destination.tags?.some((tag) => tag.toLowerCase().includes(normalizedQuery)),
      )
      .slice(0, 8);
  }, [destinations, query]);

  const recentDestinations = useMemo(
    () =>
      recentDestinationIds
        .map((id) => destinations.find((destination) => destination.id === id))
        .filter((destination): destination is Destination => Boolean(destination)),
    [destinations, recentDestinationIds],
  );

  const recommendedDestinations = useMemo(() => {
    const recentSet = new Set(recentDestinationIds);
    const nonRecent = destinations.filter((destination) => !recentSet.has(destination.id));
    return nonRecent.slice(0, 8);
  }, [destinations, recentDestinationIds]);

  const saveRecentDestination = (destinationId: string) => {
    const next = [destinationId, ...recentDestinationIds.filter((id) => id !== destinationId)].slice(0, 4);
    setRecentDestinationIds(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('luwas-recent-destination-ids', JSON.stringify(next));
    }
  };

  const handleFocus = () => {
    setShowRecommendations(false);
    if (query.trim().length > 0) {
      setShowDropdown(true);
      setPanelOpen(false);
    } else {
      setShowDropdown(false);
      setPanelOpen(true);
    }

    if (rootRef.current) {
      gsap.to(rootRef.current, {
        '--focus-progress': 1,
        duration: 0.25,
        ease: 'power2.out',
      } as gsap.TweenVars);
    }
  };

  const handleSelectDestination = (destination: Destination) => {
    setSelectedDestination(destination);
    setQuery(destination.name);
    setShowDropdown(false);
    setShowRecommendations(false);
    setPanelOpen(true);
  };

  const handleSearch = () => {
    if (selectedDestination) {
      saveRecentDestination(selectedDestination.id);
      const params = new URLSearchParams();
      if (departureDate) params.set('date', departureDate);
      if (travelers > 1) params.set('travelers', String(travelers));
      const queryString = params.toString();
      router.push(`/destinations/${selectedDestination.id}${queryString ? `?${queryString}` : ''}`);
      return;
    }

    if (query.trim()) {
      setShowRecommendations(false);
      router.push(`/destinations?search=${encodeURIComponent(query.trim())}`);
      return;
    }

    setShowDropdown(false);
    setPanelOpen(false);
    setShowRecommendations((value) => !value);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div ref={rootRef} className="w-full max-w-3xl mx-auto">
      <div className="hero-search-shell rounded-[30px] border border-white/30 bg-black/[0.16] backdrop-blur-md p-3 md:p-4">
        <div className="relative">
          <div className="rounded-full border border-white/25 bg-white/[0.11] px-4 py-3 md:py-3.5 flex items-center gap-3">
            <MapPin className="w-4 h-4 text-white/70 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onFocus={handleFocus}
              onChange={(event) => {
                const value = event.target.value;
                setQuery(value);
                setSelectedDestination(null);
                setShowRecommendations(false);
                if (value.trim()) {
                  setShowDropdown(true);
                  setPanelOpen(false);
                } else {
                  setShowDropdown(false);
                  setPanelOpen(true);
                }
              }}
              placeholder="Where do you want to go?"
              className="w-full bg-transparent text-white placeholder:text-white/70 text-sm md:text-base leading-[1.4] focus:outline-none"
            />

            <button
              ref={searchButtonRef}
              type="button"
              onMouseEnter={() => {
                if (searchButtonRef.current) {
                  gsap.to(searchButtonRef.current, {
                    scale: 1.03,
                    filter: 'brightness(1.1)',
                    duration: 0.2,
                    ease: 'power2.out',
                  });
                }
              }}
              onMouseLeave={() => {
                if (searchButtonRef.current) {
                  gsap.to(searchButtonRef.current, {
                    scale: 1,
                    filter: 'brightness(1)',
                    duration: 0.2,
                    ease: 'power2.out',
                  });
                }
              }}
              onClick={handleSearch}
              className="flex-shrink-0 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-4 py-2.5 text-xs md:text-sm font-semibold tracking-[0.07em] cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" />
                SEARCH
              </span>
            </button>
          </div>

          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-white/15 bg-black/72 backdrop-blur-lg shadow-2xl overflow-hidden z-40">
              {filteredDestinations.length === 0 ? (
                <p className="px-5 py-4 text-sm text-white/75">No destinations found.</p>
              ) : (
                filteredDestinations.map((destination) => (
                  <button
                    key={destination.id}
                    type="button"
                    onClick={() => handleSelectDestination(destination)}
                    className="w-full px-5 py-3 flex items-center gap-3.5 hover:bg-white/10 transition text-left border-b border-white/10 last:border-b-0 cursor-pointer"
                  >
                    <div className="relative w-12 h-10 rounded-md overflow-hidden bg-white/15 flex-shrink-0">
                      <Image
                        src={destination.imageUrl || '/images/fallback.jpg'}
                        alt={destination.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-white font-semibold leading-[1.35] truncate">{destination.name}</p>
                      <p className="text-xs text-white/72 leading-[1.5] truncate">{destination.location}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {showRecommendations && !showDropdown && (
          <div className="mt-3 rounded-2xl border border-white/15 bg-black/72 backdrop-blur-lg shadow-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10">
              <h4 className="text-white/90 text-sm font-semibold tracking-[0.04em] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-300" />
                Recommended destinations
              </h4>
              <p className="text-white/60 text-xs mt-1">Pick a destination to continue with departure and travelers.</p>
            </div>

            {recentDestinations.length > 0 && (
              <div className="px-4 py-3 border-b border-white/10">
                <p className="text-white/70 text-xs uppercase tracking-[0.08em] mb-2 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5" />
                  Recent searches
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {recentDestinations.map((destination) => (
                    <button
                      key={`recent-${destination.id}`}
                      type="button"
                      onClick={() => handleSelectDestination(destination)}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left hover:bg-white/10 transition cursor-pointer"
                    >
                      <p className="text-white text-sm font-semibold truncate">{destination.name}</p>
                      <p className="text-white/65 text-xs truncate">{destination.location}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {recommendedDestinations.map((destination) => (
                <button
                  key={`recommended-${destination.id}`}
                  type="button"
                  onClick={() => handleSelectDestination(destination)}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition px-3 py-2.5 text-left cursor-pointer"
                >
                  <div className="relative w-12 h-10 rounded-md overflow-hidden bg-white/15 flex-shrink-0">
                    <Image
                      src={destination.imageUrl || '/images/fallback.jpg'}
                      alt={destination.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-white font-semibold truncate">{destination.name}</p>
                    <p className="text-xs text-white/70 truncate">{destination.location}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div
          ref={panelRef}
          style={{ display: 'none', height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/20 bg-white/10 px-3 py-2.5">
              <label className="flex items-center gap-2 text-white/80 text-xs tracking-[0.06em] font-semibold mb-1.5">
                <Calendar className="w-3.5 h-3.5" />
                DEPARTURE
              </label>
              <input
                type="date"
                min={today}
                value={departureDate}
                onChange={(event) => setDepartureDate(event.target.value)}
                className="w-full bg-transparent text-white text-sm focus:outline-none [color-scheme:dark]"
              />
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/10 px-3 py-2.5">
              <label className="flex items-center gap-2 text-white/80 text-xs tracking-[0.06em] font-semibold mb-1.5">
                <Users className="w-3.5 h-3.5" />
                TRAVELERS
              </label>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/90">
                  {travelers} {travelers === 1 ? 'Adult' : 'Adults'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTravelers((count) => Math.max(1, count - 1))}
                    className="w-7 h-7 rounded-full bg-white/15 text-white hover:bg-white/25 transition flex items-center justify-center cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setTravelers((count) => Math.min(20, count + 1))}
                    className="w-7 h-7 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:brightness-110 transition flex items-center justify-center cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
