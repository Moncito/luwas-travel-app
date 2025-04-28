"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);

    const checkAuth = async () => {
        try {
        const res = await fetch("/api/auth/user");
        const data = await res.json();
        setIsAuthenticated(!!data.user);
        } catch {
        setIsAuthenticated(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const handleLogout = async () => {
        setLoading(true);
        await fetch("/api/auth/logout", { method: "POST" });
        await checkAuth();
        setLoading(false);
        router.push("/sign-in");
    };

    const navItems = [
        { href: "/about", text: "ABOUT" },
        { href: "/services", text: "SERVICES" },
        { href: "/destinations", text: "DESTINATIONS" },
        { href: "/plan", text: "PLAN / BOOK" },
    ];

    return (
        <nav className="absolute top-0 left-0 w-full z-50 bg-transparent backdrop-blur-md">
        <div className="container mx-auto px-6 py-6 flex items-center justify-between">
            
            {/* Left - LUWAS */}
            <div className="flex-shrink-0">
            <Link href="/" className="text-white text-2xl md:text-3xl font-bold tracking-wide animate-fade-in">
                LUWAS
            </Link>
            </div>

            {/* Center - Nav Menu */}
            <div className="hidden lg:flex space-x-8">
            {navItems.map(item => (
                <Link 
                key={item.href} 
                href={item.href} 
                className="text-white font-semibold hover:underline underline-offset-8 transition duration-300 ease-in-out text-sm xl:text-base"
                >
                {item.text}
                </Link>
            ))}
            </div>

            {/* Right - Login/Logout */}
            <div className="hidden lg:flex space-x-4">
            {isAuthenticated ? (
                <button
                onClick={handleLogout}
                disabled={loading}
                className="text-white font-semibold hover:underline underline-offset-8 transition duration-300 ease-in-out text-sm xl:text-base"
                >
                {loading ? "Logging out..." : "LOGOUT"}
                </button>
            ) : (
                <button
                onClick={() => router.push("/sign-in")}
                className="bg-white text-black font-semibold px-4 py-2 rounded-full hover:bg-gray-200 transition duration-300 ease-in-out text-sm xl:text-base"
                >
                LOGIN
                </button>
            )}
            </div>

            {/* Mobile Hamburger */}
            <div className="lg:hidden flex items-center">
            <button onClick={toggleMobileMenu} className="text-white focus:outline-none">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
            </div>

        </div>

        {/* Mobile Dropdown */}
        {isMobileMenuOpen && (
            <div className="mt-4 bg-white rounded-lg shadow-lg p-4 space-y-4 animate-fade-in lg:hidden">
            {navItems.map(item => (
                <Link
                key={item.href}
                href={item.href}
                onClick={toggleMobileMenu}
                className="block text-center text-black font-semibold hover:text-gray-400 transition duration-300 ease-in-out"
                >
                {item.text}
                </Link>
            ))}
            {isAuthenticated ? (
                <button
                onClick={async () => {
                    toggleMobileMenu();
                    await handleLogout();
                }}
                className="block w-full text-black font-semibold hover:text-gray-400 transition duration-300 ease-in-out text-center"
                >
                {loading ? "Logging out..." : "LOGOUT"}
                </button>
            ) : (
                <button
                onClick={() => {
                    toggleMobileMenu();
                    router.push("/sign-in");
                }}
                className="block w-full text-black font-semibold hover:text-gray-400 transition duration-300 ease-in-out text-center"
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
