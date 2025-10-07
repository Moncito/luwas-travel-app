'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoaderStore } from '@/lib/useLoaderStore';
import PlaneLottieLoader from '@/app/components/PlaneLottieLoader';

export default function RouteChangeLoader() {
  const router = useRouter();
  const { isLoading, setLoading } = useLoaderStore();

  useEffect(() => {
    // ✅ Function to show loader immediately
    const showLoader = () => setLoading(true);
    const hideLoader = () => setLoading(false);

    // ✅ 1. Patch router.push & router.replace to show loader instantly
    const originalPush = router.push;
    const originalReplace = router.replace;

    (router as any).push = (...args: Parameters<typeof router.push>) => {
      showLoader();
      requestAnimationFrame(() => originalPush(...args));
    };

    (router as any).replace = (...args: Parameters<typeof router.replace>) => {
      showLoader();
      requestAnimationFrame(() => originalReplace(...args));
    };

    // ✅ 2. Detect <a href=""> clicks anywhere in the DOM
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]');
      if (link && link.getAttribute('href') !== window.location.pathname) {
        showLoader();
      }
    };
    document.addEventListener('click', handleClick);

    // ✅ 3. Close loader when route path actually changes
    let lastPath = window.location.pathname;
    const watcher = setInterval(() => {
      if (window.location.pathname !== lastPath) {
        lastPath = window.location.pathname;
        setTimeout(hideLoader, 500); // smooth fade-out
      }
    }, 100);

    return () => {
      document.removeEventListener('click', handleClick);
      clearInterval(watcher);
      (router as any).push = originalPush;
      (router as any).replace = originalReplace;
    };
  }, [router, setLoading]);

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          key="luwas-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-sky-100 z-[9999]"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <PlaneLottieLoader />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-blue-700 font-semibold text-lg tracking-wide animate-pulse"
          >
            Preparing your next destination...
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
