'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import ScrollToTop from './ScrollToTop';
import { Toaster } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// ✅ Dynamically import client-only components
const RouteChangeLoader = dynamic(() => import('@/components/RouteChangeLoader'), { ssr: false });
const PlaneLottieLoader = dynamic(() => import('./PlaneLottieLoader'), { ssr: false });

export default function LayoutWithLoader({ children }: { children: React.ReactNode }) {
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setInitialLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Loaders are now client-only and safe */}
      <RouteChangeLoader />
      <ScrollToTop />

      <AnimatePresence mode="wait">
        {initialLoading ? (
          <PlaneLottieLoader key="loader" />
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>

      <Toaster />
    </>
  );
}
