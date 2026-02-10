import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: false, // <- Désactive l’optimisation pour permettre l’export statique
  },
};

export default nextConfig;
