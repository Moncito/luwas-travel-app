"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/firebase/client";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  // 🔹 Listen for authentication changes
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

  // 🔹 Handle scroll blur effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🔹 Logout
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
      className={`fixed top-0 left-0 w-full z-50 transition-colors duration-500 ${
        scrolled ? "bg-black/70 backdrop-blur-md shadow-md" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 py-5 flex items-center justify-between">
        {/* 🔹 Left - Logo */}
        <Link href="/" className="text-white text-2xl md:text-3xl font-bold tracking-wide">
          LUWAS
        </Link>

        {/* 🔹 Middle - Nav Items */}
        <div className="hidden lg:flex space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative font-semibold text-sm xl:text-base transition duration-300
                ${pathname === item.href ? "text-white" : "text-gray-300 hover:text-white"}`}
            >
              {item.text}
              {pathname === item.href && (
                <span className="absolute left-0 -bottom-1 w-full h-[2px] bg-white rounded-full"></span>
              )}
            </Link>
          ))}
        </div>

        {/* 🔹 Right - Auth Section */}
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

              {/* 🔹 Profile Dropdown */}
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

        {/* 🔹 Mobile Menu Icon */}
        <div className="lg:hidden flex items-center">
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="text-white focus:outline-none"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* 🔹 Mobile Dropdown */}
      {isMobileMenuOpen && (
        <div className="animate-slide-down bg-white/95 backdrop-blur-md shadow-lg rounded-lg p-4 space-y-4 lg:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block text-center font-semibold text-base transition-colors ${
                pathname === item.href ? "text-black" : "text-gray-700 hover:text-black"
              }`}
            >
              {item.text}
            </Link>
          ))}
          {isAuthenticated ? (
            <>
              <Link
                href="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-center font-semibold text-base text-gray-700 hover:text-black"
              >
                Profile
              </Link>
              <button
                onClick={async () => {
                  setIsMobileMenuOpen(false);
                  await handleLogout();
                }}
                className="block w-full text-gray-700 font-semibold hover:text-black text-center transition-colors"
              >
                {loading ? "Logging out..." : "LOGOUT"}
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                router.push("/sign-in");
              }}
              className="block w-full bg-black text-white font-semibold py-2 rounded-lg hover:bg-gray-800 transition"
            >
              LOGIN
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
