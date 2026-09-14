import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "THE LAST EMPIRE | آخرین امپراتوری",
    short_name: "The Last Empire",
    description:
      "Advanced geopolitical simulation, sovereign statecraft, and tactical conquest game.",
    start_url: "/",
    display: "standalone",
    orientation: "landscape",
    background_color: "#070a12",
    theme_color: "#070a12",
    categories: ["games", "strategy", "simulation"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
