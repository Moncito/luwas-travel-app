import type { NextConfig } from "next";

const NextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, // ← temporarily set to true for deployment
  },
  images: {
    domains: [
      'i.imgur.com',
      's3-media3.fl.yelpcdn.com',
      'upload.wikimedia.org',
      'images.unsplash.com',
      'lh3.googleusercontent.com',
      's3-media0.fl.yelpcdn.com',
      's3-media1.fl.yelpcdn.com',
      's3-media2.fl.yelpcdn.com',
      's3-media3.fl.yelpcdn.com',
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '1mb',
      allowedOrigins: ['*'],
    },
  },
};
export default NextConfig;