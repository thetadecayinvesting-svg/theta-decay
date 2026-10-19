import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Build pages with 2 workers instead of one per CPU core, so the FRED requests
    // made while building stay a handful at a time (see the throttle in lib/fred.ts).
    cpus: 2,
    // inlineCss was tried (Oct 2026): it removed the render-blocking stylesheet but
    // made pages heavier and scored slightly worse on mobile Lighthouse, so it's off.
  },
};

export default nextConfig;
