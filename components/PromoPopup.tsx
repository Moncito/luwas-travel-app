"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface PromoPopupProps {
  images: string[];
  link?: string;
}

export default function PromoPopup({
  images,
  link = "/promos",
}: PromoPopupProps) {
  const [show, setShow] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [current, setCurrent] = useState(0);
  const pathname = usePathname();

  // Run hooks normally
  useEffect(() => {
    if (pathname !== "/") return; // ✅ Only run on homepage
    const timer = setTimeout(() => {
      setShow(true);
      setTimeout(() => setAnimate(true), 50);
    }, 5000);
    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    if (!show || pathname !== "/") return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [show, pathname, images.length]);

  // ✅ Safe conditional render
  if (!show || pathname !== "/") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div
        className={`relative bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden transform transition-all duration-700 ${
          animate ? "opacity-100 scale-100" : "opacity-0 scale-90"
        }`}
      >
        {/* Close button */}
        <button
          onClick={() => setShow(false)}
          className="absolute top-2 right-2 bg-black/70 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black transition z-20 cursor-pointer"
        >
          ✕
        </button>

        {/* Image wrapper with fixed 16:9 ratio */}
        <Link href={link} className="block w-full aspect-video relative">
          {images.map((img, index) => (
            <Image
              key={index}
              src={img}
              alt={`Promo ${index + 1}`}
              fill
              priority={index === current}
              className={`object-contain bg-black transition-opacity duration-[1200ms] ease-in-out ${
                index === current ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </Link>

        {/* Navigation dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-2.5 w-2.5 rounded-full transition duration-500 ${
                index === current ? "bg-white" : "bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
