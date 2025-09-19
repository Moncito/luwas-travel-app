"use client";

import { useEffect, useState, ReactNode } from "react";
import Image from "next/image";
import { Playfair_Display, Poppins } from "next/font/google";

// ✅ Fonts
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500"],
});

const images = ["/images/slide1.jpg", "/images/slide2.jpg", "/images/slide3.jpg"];

export default function AuthLayout({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen grid grid-cols-1 md:grid-cols-2 overflow-hidden">
      {/* Background slideshow */}
      {images.map((src, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={src}
            alt={`Background ${index + 1}`}
            fill
            className="object-cover"
            priority={index === 0}
          />
          <div className="absolute inset-0 bg-black/70" />
        </div>
      ))}

      {/* Left: Auth Form */}
      <div className="relative z-10 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md backdrop-blur-xl bg-white/5 border border-white/30 shadow-2xl rounded-2xl p-10">
          {children} {/* AuthForm goes here */}
        </div>
      </div>

        {/* Right: Hero text */}
        <div className="relative z-10 hidden mb-5 md:flex flex-col justify-center px-8 md:px-8 lg:px-6 gap-y-6 max-w-2xl">
        <h1
            className={`text-5xl md:text-6xl lg:text-7xl font-bold text-white drop-shadow-2xl leading-tight tracking-wide ${playfair.className}`}
        >
            Travel Beyond <span className="text-white">Boundaries</span>
        </h1>

        <p
            className={`text-lg md:text-xl lg:text-2xl text-gray-200 max-w-lg leading-relaxed tracking-wide ${poppins.className}`}
        >
            Experience the world’s most breathtaking destinations with{" "}
            <span className="font-semibold text-blue-400">Luwas</span>. Your journey
            to unforgettable memories starts here.
        </p>

        <p
            className={`text-base md:text-lg italic text-gray-200 tracking-wide ${poppins.className}`}
        >
            Luxury is not about money, it’s about experiences that last forever.
        </p>

        <p
            className={`text-base md:text-lg italic text-gray-200 tracking-wide ${poppins.className}`}
        >
            - Luwas 2025
        </p>
        </div>

    </div>
  );
}
