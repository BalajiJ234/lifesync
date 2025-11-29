import type { NextConfig } from "next";

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

const nextConfig: NextConfig = {
  // Base path for path-based routing (lifesync.app/wealth-pulse)
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  
  // Asset prefix for CDN/subpath deployment
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',
};

export default withPWA(nextConfig);
