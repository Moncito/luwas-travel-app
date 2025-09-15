// File: components/itineraries/AnimatedHighlights.tsx
"use client";

import { motion } from "framer-motion";

export default function AnimatedHighlights({ highlights }: { highlights: string[] }) {
  if (!Array.isArray(highlights) || highlights.length === 0) return null;

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Daily Highlights</h2>
      <div className="relative border-l-2 border-blue-500 pl-8 space-y-8">
        {highlights.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.2 }}
            className="relative pl-4"
          >
            {/* Dot */}
            <span className="absolute -left-[1.05rem] top-2 h-4 w-4 rounded-full bg-blue-600 border-2 border-white shadow-md" />

            {/* Day number */}
            <h3 className="text-blue-700 font-bold text-lg mb-1">
              Day {idx + 1}
            </h3>

            {/* Highlight text */}
            <p className="text-gray-700 text-sm leading-relaxed">{item}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
