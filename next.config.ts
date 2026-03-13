import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use standalone for server deployment (PWA)
  // Change to 'export' for pure static build (Capacitor)
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
