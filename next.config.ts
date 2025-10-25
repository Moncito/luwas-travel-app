import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.imgur.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "s3-media0.fl.yelpcdn.com" },
      { protocol: "https", hostname: "s3-media1.fl.yelpcdn.com" },
      { protocol: "https", hostname: "s3-media2.fl.yelpcdn.com" },
      { protocol: "https", hostname: "s3-media3.fl.yelpcdn.com" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
      allowedOrigins: ["*"],
    },
  },
};

export default nextConfig;
