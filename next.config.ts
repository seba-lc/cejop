import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        // Redirect temporal: la vieja ruta /encuesta manda a la landing.
        // Las CTAs activas apuntan ahora a /encuestas_ev1.
        source: "/encuesta",
        destination: "/",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
