'use client';

import Image from 'next/image';

const PlaneGifLoader = () => {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      <Image
        src="/pageloader.gif"
        alt="Loading..."
        width={192}
        height={192}
        className="animate-bounce"
        priority
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

export default PlaneGifLoader;
