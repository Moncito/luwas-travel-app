"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/firebase/client";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";
import gsap from "gsap";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const navRootRef = useRef<HTMLElement | null>(null);
  const navRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const homeUnderlineRef = useRef<HTMLSpanElement | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  // ✅ Listen for authentication changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        try {
          const userRef = doc(db, "users", user.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const data = snap.data();
            setAvatarUrl(data.avatarUrl || null);
          }
        } catch (err) {
          console.error("Error fetching avatar:", err);
        }
      } else {
        setIsAuthenticated(false);
        setAvatarUrl(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // ✅ Scroll detection for subtle nav shadow
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ Lock body scroll when mobile menu opens
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const items = navRefs.current.filter((node): node is HTMLAnchorElement => node !== null);

    if (items.length === 0 || !navRootRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.from(items, {
        opacity: 0,
        y: 14,
        duration: 0.55,
        stagger: 0.08,
        ease: "power2.out",
        delay: 0.1,
      });

      if (homeUnderlineRef.current) {
        gsap.fromTo(
          homeUnderlineRef.current,
          { scaleX: 0 },
          { scaleX: 1, duration: 0.55, ease: "power2.out", delay: 0.45 },
        );
      }
    }, navRootRef);

    return () => {
      ctx.revert();
    };
  }, []);

  // ✅ Logout function
  const handleLogout = async () => {
    setLoading(true);
    await signOut(auth);
    setIsAuthenticated(false);
    setLoading(false);
    router.push("/sign-in");
  };

  const navItems = [
    { href: "/", text: "HOME" },
    { href: "/itineraries", text: "ITINERARIES" },
    { href: "/promos", text: "PROMO!" },
    { href: "/destinations", text: "DESTINATIONS" },
    { href: "/history", text: "TRAVEL HISTORY" },
  ];

  return (
    <nav
      ref={navRootRef}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-black/70 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.28)]"
          : "bg-gradient-to-b from-black/65 via-black/25 to-transparent"
      }`}
    >
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/35 via-black/5 to-transparent" />
      <div className="container relative mx-auto px-6 py-5 flex items-center justify-between">
        {/* 🌍 Logo */}
        <Link
          href="/"
          className="text-white text-2xl md:text-3xl font-extrabold tracking-[0.25em] drop-shadow-md"
        >
          LUWAS
        </Link>

        {/* 💻 Desktop Nav */}
        <div className="hidden lg:flex space-x-10">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href;
            const isHome = item.href === "/";
            return (
              <Link
                key={item.href}
                href={item.href}
                ref={(node) => {
                  navRefs.current[index] = node;
                }}
                data-active={isActive}
                className="nav-item-premium relative group font-semibold text-xs xl:text-sm transition duration-300 text-white/90 hover:text-white"
              >
                {item.text}
                
                {/* Animated Underline */}
                <span
                  ref={isHome ? homeUnderlineRef : null}
                  className={`nav-link-underline absolute left-0 -bottom-2 w-full h-[2px] bg-white rounded-full ${isActive ? "scale-x-100" : ""}`}
                />
              </Link>
            );
          })}
        </div>

        {/* 👤 Desktop Auth */}
        <div className="hidden lg:flex items-center space-x-4 relative">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen((prev) => !prev)}
                className="focus:outline-none"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md bg-gray-200"
                >
                  <Image
                    src={avatarUrl || "/images/default-avatar.jpg"}
                    alt="User Avatar"
                    width={40}
                    height={40}
                    className="object-cover w-full h-full cursor-pointer"
                    unoptimized
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
              </button>

              <AnimatePresence>
                {profileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg py-2"
                  >
                    <Link
                      href="/profile"
                      onClick={() => setProfileMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/history"
                      onClick={() => setProfileMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Travel History
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      {loading ? "Logging out..." : "Logout"}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={() => router.push("/sign-in")}
              className="bg-white text-black font-semibold px-4 py-2 rounded-full hover:bg-gray-200 transition text-sm xl:text-base"
            >
              LOGIN
            </button>
          )}
        </div>

        {/* 🍔 Mobile Toggle Button */}
        <div className="lg:hidden flex items-center">
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="text-white focus:outline-none"
          >
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  isMobileMenuOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
        </div>
      </div>

      {/* 🌫️ Mobile Glass Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="
              lg:hidden fixed inset-0 top-[72px] z-40
              bg-gradient-to-b from-black/10 via-black/55 to-black/40
              backdrop-blur-xl border-t border-white/10
              flex flex-col items-center justify-start space-y-6 py-10
              overflow-y-auto
            "
          >
            {navItems.map((item) => (
              <motion.div
                key={item.href}
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <Link
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-lg font-medium tracking-wide transition-all duration-200 ${
                    pathname === item.href
                      ? 'text-white underline underline-offset-4'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  {item.text}
                </Link>
              </motion.div>
            ))}

            {/* 🔐 Auth Buttons */}
            <div className="pt-8 w-full flex flex-col items-center space-y-3">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-white/80 hover:text-white text-lg"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={async () => {
                      setIsMobileMenuOpen(false);
                      await handleLogout();
                    }}
                    className="text-red-400 hover:text-red-200 font-semibold text-lg"
                  >
                    {loading ? "Logging out..." : "Logout"}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    router.push("/sign-in");
                  }}
                  className="
                    mt-2 px-8 py-2 text-sm font-semibold text-white
                    bg-white/10 border border-white/20 rounded-full
                    backdrop-blur-md shadow-inner
                    hover:bg-white/20 hover:scale-105 transition-all duration-300
                  "
                >
                  LOGIN
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
