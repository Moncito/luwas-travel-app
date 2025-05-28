'use client';

import Lottie from 'lottie-react';
import planeLoader from './lottie/planeloader.json'; // ✅ Correct path now

const PlaneLottieLoader = () => {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[9999] transition-opacity duration-700">
      <Lottie
        animationData={planeLoader}
        loop
        className="w-48 h-48"
      />
      <h1 className="mt-4 text-4xl font-extrabold text-black animate-pulse tracking-wider drop-shadow-lg">
        <span className="animate-[blinker_1.2s_infinite]">LUWAS</span>
      </h1>

      <style jsx>{`
        @keyframes blinker {
          50% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default PlaneLottieLoader;
