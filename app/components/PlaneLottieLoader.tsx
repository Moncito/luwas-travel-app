'use client';

import Lottie from 'lottie-react';
import planeLoader from './lottie/planeloader.json';

const PlaneLottieLoader = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-sky-100 z-[9999] transition-all duration-700">
      <Lottie animationData={planeLoader} loop className="w-44 h-44 sm:w-56 sm:h-56 drop-shadow-md" />

      <h1 className="mt-6 text-4xl sm:text-5xl font-extrabold text-blue-800 tracking-widest animate-pulse drop-shadow-md">
        <span className="relative">
          L<span className="text-sky-500">U</span>WAS
        </span>
      </h1>

      <p className="mt-3 text-blue-600 font-semibold text-sm sm:text-base animate-pulse">
        Traveling beyond borders...
      </p>
    </div>
  );
};

export default PlaneLottieLoader;
