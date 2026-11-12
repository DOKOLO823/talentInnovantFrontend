import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // <- Désactive l’optimisation pour permettre l’export statique
  },

  async headers() {
  return [
    {
      source: "/sw.js",
      headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }],
    },
  ];
},


};

export default nextConfig;
