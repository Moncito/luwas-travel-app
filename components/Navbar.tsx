"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen((prev) => !prev);
    };

    const checkAuth = async () => {
        try {
        const res = await fetch("/api/auth/user");
        const data = await res.json();
        setIsAuthenticated(!!data.user);
        } catch (err) {
        console.error("Failed to fetch auth state");
        setIsAuthenticated(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const handleLogout = async () => {
        setLoading(true);
        await fetch("/api/auth/logout", {
        method: "POST",
        });
        await checkAuth(); // Re-check the auth state
        setLoading(false);
        router.push("/sign-in"); // Optional: Navigate to login page
    };

    const navItems = [
        { href: "/about", text: "ABOUT" },
        { href: "/services", text: "SERVICES" },
        { href: "/team", text: "TEAM" },
        { href: "/plan", text: "PLAN" },
        { href: "/explorateur", text: "EXPLORATEUR" },
        { href: "/careers", text: "CAREERS" },
        { href: "/blog", text: "BLOG" },
    ];

    return (
        <nav className="absolute top-0 left-0 w-full z-50 bg-transparent backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
            {/* Desktop Layout */}
            <div className="hidden lg:flex items-center justify-between">
            {/* Left */}
            <div className="flex items-center space-x-1">
                {navItems.slice(0, 4).map((item, index) => (
                <div key={item.href} className="flex items-center">
                    <Link
                    href={item.href}
                    className="text-black hover:text-gray-400 px-3 py-1 text-sm xl:text-base xl:px-4"
                    >
                    {item.text}
                    </Link>
                    {index < 3 && <span className="text-black text-xs">|</span>}
                </div>
                ))}
            </div>

            {/* Center */}
            <Link
                href="/"
                className="text-black text-2xl md:text-3xl lg:text-4xl font-semibold"
            >
                LUWAS
            </Link>

            {/* Right */}
            <div className="flex items-center space-x-1">
                {navItems.slice(4).map((item, index) => (
                <div key={item.href} className="flex items-center">
                    <Link
                    href={item.href}
                    className="text-black hover:text-gray-400 px-3 py-1 text-sm xl:text-base xl:px-4"
                    >
                    {item.text}
                    </Link>
                    {index < 2 && <span className="text-black text-xs">|</span>}
                </div>
                ))}

                {/* Auth Button */}
                <div>
                {isAuthenticated ? (
                    <button
                    onClick={handleLogout}
                    disabled={loading}
                    className="text-black hover:text-gray-400 px-3 py-1 text-sm xl:text-base xl:px-4"
                    >
                    {loading ? "Logging out..." : "LOGOUT"}
                    </button>
                ) : (
                    <button
                    onClick={() => router.push("/sign-in")}
                    className="text-black hover:text-gray-400 px-3 py-1 text-sm xl:text-base xl:px-4"
                    >
                    LOGIN
                    </button>
                )}
                </div>
            </div>
            </div>

            {/* Mobile Layout */}
            <div className="lg:hidden flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="text-black text-2xl font-semibold">
                LUWAS
            </Link>

            {/* Burger Icon */}
            <button
                onClick={toggleMobileMenu}
                className="text-black focus:outline-none"
            >
                <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                />
                </svg>
            </button>
            </div>

            {/* Mobile Dropdown Menu */}
            {isMobileMenuOpen && (
            <div className="lg:hidden mt-4 bg-white rounded-lg shadow-lg p-4 space-y-3 animate-fadeIn">
                {navItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    onClick={toggleMobileMenu}
                    className="block text-center text-black hover:text-gray-400"
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
                    className="block w-full text-black hover:text-gray-400 text-center"
                >
                    {loading ? "Logging out..." : "LOGOUT"}
                </button>
                ) : (
                <button
                    onClick={() => {
                    toggleMobileMenu();
                    router.push("/sign-in");
                    }}
                    className="block w-full text-black hover:text-gray-400 text-center"
                >
                    LOGIN
                </button>
                )}
            </div>
            )}
        </div>
        </nav>
    );
};

export default Navbar;
