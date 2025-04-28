'use client';

import { useTransition } from 'react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function PageLoader() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleStop = () => setLoading(false);

    router.prefetch('/'); // Preload the home route

    return () => {
      // no .events anymore in app router
    };
  }, [router]);

  return (
    <AnimatePresence>
      {(isPending || loading) && (
        <motion.div
          key="loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-0 left-0 w-full h-full bg-white flex items-center justify-center z-[9999]"
        >
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-24 w-24"></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
