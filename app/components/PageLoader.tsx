'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function PageLoader() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let navigating = false;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]');
      if (link) {
        navigating = true;
        setLoading(true);
      }
    };

    const handleComplete = () => {
      if (navigating) {
        setTimeout(() => setLoading(false), 600); // add smooth fade-out delay
        navigating = false;
      }
    };

    // Detect link clicks
    document.addEventListener('click', handleClick);

    // Detect route completion
    router.refresh(); // ensures hydration ready
    window.addEventListener('popstate', handleComplete); // for back/forward navigation

    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('popstate', handleComplete);
    };
  }, [router]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="page-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-white flex items-center justify-center z-[9999]"
        >
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-24 w-24 border-t-8 border-blue-500 border-8"></div>
            <p className="mt-4 text-blue-700 font-semibold animate-pulse">Loading...</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
