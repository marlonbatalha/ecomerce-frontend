import type { NextConfig } from "next";

// Imagem de produto vem do backend (upload salvo lá, ver ArmazenamentoDeImagensLocal) — diferente
// de dado de API (JSON), a URL da imagem É pública por natureza: o browser busca o <img>/next-image
// direto, sem passar pelo nosso servidor. next/image só otimiza host explicitamente liberado aqui.
const backendUrl = process.env.BACKEND_URL ? new URL(process.env.BACKEND_URL) : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: backendUrl
      ? [
          {
            protocol: backendUrl.protocol.replace(":", "") as "http" | "https",
            hostname: backendUrl.hostname,
            port: backendUrl.port,
            pathname: "/uploads/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
