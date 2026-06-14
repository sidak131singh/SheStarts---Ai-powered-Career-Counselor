import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better development
  reactStrictMode: true,

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  // Required for Vercel deployment with local file system usage
  // Note: .data/ directory is gitignored; in production, Supabase replaces it
  serverExternalPackages: [],

  // Allow large API responses for streaming
  async headers() {
    return [
      {
        source: '/api/counselor/stream',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-transform' },
          { key: 'X-Accel-Buffering', value: 'no' },
        ],
      },
    ];
  },
};

export default nextConfig;
