import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CuniGestion — Gestion Cuniculture",
    short_name: "CuniGestion",
    description: "Application de gestion de ferme cuniculture",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f5f0e8",
    theme_color: "#2d5a2d",
    categories: ["productivity", "utilities"],
    icons: [
      {
        src: "/pwa-icons/72",
        sizes: "72x72",
        type: "image/png",
      },
      {
        src: "/pwa-icons/96",
        sizes: "96x96",
        type: "image/png",
      },
      {
        src: "/pwa-icons/128",
        sizes: "128x128",
        type: "image/png",
      },
      {
        src: "/pwa-icons/144",
        sizes: "144x144",
        type: "image/png",
      },
      {
        src: "/pwa-icons/152",
        sizes: "152x152",
        type: "image/png",
      },
      {
        src: "/pwa-icons/192",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/pwa-icons/384",
        sizes: "384x384",
        type: "image/png",
      },
      {
        src: "/pwa-icons/512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa-icons/512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
