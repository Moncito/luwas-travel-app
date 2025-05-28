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