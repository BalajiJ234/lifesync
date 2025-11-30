import type { NextConfig } from "next";

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // Base path for path-based routing (balaji-dev.in/life-sync/wealth)
  basePath: "/life-sync/wealth",

  // Asset prefix for CDN/subpath deployment
  assetPrefix: "/life-sync/wealth",
};

export default withPWA(nextConfig);
