'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import PlaneLottieLoader from './PlaneLottieLoader';

export default function RouteChangeLoader() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200); // Adjust for route load smoothness

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!loading) return null;
  return <PlaneLottieLoader />;
}
