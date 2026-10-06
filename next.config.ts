import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Build pages with 2 workers instead of one per CPU core, so the FRED requests
    // made while building stay a handful at a time (see the throttle in lib/fred.ts).
    cpus: 2,
  },
};

export default nextConfig;
