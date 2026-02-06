import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // output: 'export',
  images: {
    unoptimized: true, // <- Désactive l’optimisation pour permettre l’export statique
  },
};

export default nextConfig;
