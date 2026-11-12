import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TALENT INNOVANT",
    short_name: "TALENT INNOVANT",
    description: "Le carrefour des opportunités : challenges, hackathons et collaborations.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",        // s'ouvre comme une vraie app, sans barre d'adresse
    background_color: "#ffffff",
    theme_color: "#c2410c",       // votre orange-700
    lang: "fr",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}