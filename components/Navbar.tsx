"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { auth } from "@/firebase/client"

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = async () => {
    setLoading(true)
    await signOut(auth)
    setIsAuthenticated(false)
    setLoading(false)
    router.push("/sign-in")
  }

  const navItems = [
    { href: "/", text: "HOME" },
    { href: "/itineraries", text: "ITINERARIES" },
    { href: "/promos", text: "PROMO!" },
    { href: "/destinations", text: "DESTINATIONS" },
    { href: "/history", text: "TRAVEL HISTORY" },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-colors duration-500 ${
        scrolled ? "bg-black/70 backdrop-blur-md shadow-md" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 py-5 flex items-center justify-between">

        {/* Left - Logo */}
        <Link href="/" className="text-white text-2xl md:text-3xl font-bold tracking-wide">
          LUWAS
        </Link>

        {/* Center - Nav Items */}
        <div className="hidden lg:flex space-x-8">
          {navItems.map(item => (
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

        {/* Right - Auth Button */}
        <div className="hidden lg:flex space-x-4">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              disabled={loading}
              className="text-gray-300 hover:text-white font-semibold transition-colors text-sm xl:text-base"
            >
              {loading ? "Logging out..." : "LOGOUT"}
            </button>
          ) : (
            <button
              onClick={() => router.push("/sign-in")}
              className="bg-white text-black font-semibold px-4 py-2 rounded-full hover:bg-gray-200 transition text-sm xl:text-base"
            >
              LOGIN
            </button>
          )}
        </div>

        {/* Mobile Menu Icon */}
        <div className="lg:hidden flex items-center">
          <button onClick={toggleMobileMenu} className="text-white focus:outline-none">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="animate-slide-down bg-white/95 backdrop-blur-md shadow-lg rounded-lg p-4 space-y-4 lg:hidden">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={toggleMobileMenu}
              className={`block text-center font-semibold text-base transition-colors ${
                pathname === item.href ? "text-black" : "text-gray-700 hover:text-black"
              }`}
            >
              {item.text}
            </Link>
          ))}
          {isAuthenticated ? (
            <button
              onClick={async () => {
                toggleMobileMenu()
                await handleLogout()
              }}
              className="block w-full text-gray-700 font-semibold hover:text-black text-center transition-colors"
            >
              {loading ? "Logging out..." : "LOGOUT"}
            </button>
          ) : (
            <button
              onClick={() => {
                toggleMobileMenu()
                router.push("/sign-in")
              }}
              className="block w-full bg-black text-white font-semibold py-2 rounded-lg hover:bg-gray-800 transition"
            >
              LOGIN
            </button>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar
