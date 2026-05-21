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
        // Redirect histórico: la vieja ruta /encuesta manda a la landing.
        source: "/encuesta",
        destination: "/",
        permanent: false,
      },
      {
        // Form del 1er encuentro: redirige al activo. Los CTAs nuevos
        // apuntan directo a /encuestas_ev2; este redirect rescata el
        // tráfico del link viejo que todavía circula en redes.
        source: "/encuestas_ev1",
        destination: "/encuestas_ev2",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
