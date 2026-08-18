import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Turns named imports from react-icons (used throughout the app,
    // including the public /[username] page) into per-icon imports at
    // build time, instead of pulling in more of the package than needed.
    optimizePackageImports: ["react-icons"],
  },
};

export default nextConfig;
