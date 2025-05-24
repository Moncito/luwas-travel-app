'use client';

import { useEffect, useState } from 'react';
import PlaneLottieLoader from './PlaneLottieLoader';
import RouteChangeLoader from './RouteChangeLoader';
import ScrollToTop from './ScrollToTop';
import { Toaster } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function LayoutWithLoader({ children }: { children: React.ReactNode }) {
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setInitialLoading(false), 2000); // show loader for 2 seconds
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
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
