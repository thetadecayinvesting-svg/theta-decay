import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Build pages with 2 workers instead of one per CPU core, so the FRED requests
    // made while building stay a handful at a time (see the throttle in lib/fred.ts).
    cpus: 2,
    // Put the site's small stylesheet (~8 KB) straight into each page instead of a
    // separate file, so phones don't wait on an extra download before showing anything.
    inlineCss: true,
  },
};

export default nextConfig;
