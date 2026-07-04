"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import HeroSearchWidget from "@/components/(homepage)/HeroSearchWidget";

gsap.registerPlugin(ScrollTrigger);

const HeroSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const backgroundLayerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const scrollCueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const bg = backgroundLayerRef.current;
    const content = contentRef.current;
    const subtext = subtextRef.current;
    const search = searchRef.current;
    const scrollCue = scrollCueRef.current;

    if (!section || !bg || !content || !subtext || !search || !scrollCue) {
      return;
    }

    const ctx = gsap.context(() => {
      const words = content.querySelectorAll<HTMLElement>(".hero-word");

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(words, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
      })
        .from(
          subtext,
          {
            y: 30,
            opacity: 0,
            duration: 0.7,
          },
          "-=0.35",
        )
        .from(
          search,
          {
            y: 60,
            opacity: 0,
            duration: 0.8,
          },
          "-=0.2",
        )
        .from(
          scrollCue,
          {
            y: 18,
            opacity: 0,
            duration: 0.5,
          },
          "-=0.3",
        );

      gsap.fromTo(
        scrollCue,
        { y: 0, opacity: 0.45 },
        {
          y: 10,
          opacity: 1,
          duration: 1.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 1.1,
        },
      );

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          gsap.to(bg, {
            yPercent: self.progress * 12,
            duration: 0.15,
            overwrite: true,
            ease: "none",
          });
        },
      });
    }, section);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div ref={sectionRef} className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">
      <div ref={backgroundLayerRef} className="absolute inset-0 will-change-transform">
        <Image
          src="/saint1.jpg"
          alt="Philippines Scenic View"
          fill
          priority
          className="object-cover scale-[1.08] md:scale-[1.12]"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/36 via-black/18 to-black/46 z-10" />

      <div ref={contentRef} className="relative z-20 w-full max-w-5xl px-6 pt-20 md:pt-28 flex flex-col items-center text-center">
        <h1 className="text-white">
          <span className="hero-title-line-one block">
            <span className="hero-word inline-block">Your</span>{" "}
            <span className="hero-word inline-block">Next</span>{" "}
            <span className="hero-word inline-block">Great</span>{" "}
            <span className="hero-word hero-accent-serif inline-block">Escape</span>
          </span>
          <span className="hero-title-line-two hero-gradient-shimmer block mt-3">
            <span className="hero-word inline-block">Starts</span>{" "}
            <span className="hero-word inline-block">Here</span>
          </span>
        </h1>

        <p ref={subtextRef} className="mt-6 text-lg sm:text-xl md:text-2xl text-white/90 leading-relaxed max-w-2xl drop-shadow">
          From hidden beaches to mountain retreats. Explore breathtaking destinations across the Philippines.
        </p>

        <div ref={searchRef} className="w-full mt-12 md:mt-16">
          <HeroSearchWidget />
        </div>
      </div>

      <div
        ref={scrollCueRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/75 text-2xl z-20 drop-shadow-lg"
        aria-hidden="true"
      >
        ↓
      </div>
    </div>
  );
};

export default HeroSection;
