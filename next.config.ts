import type { NextConfig } from "next";

type PadraoRemoto = NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>[number];

/** Libera pro next/image as imagens servidas a partir de `url` (só esse host, só esse caminho). */
function padraoPara(url: URL, caminho: string): PadraoRemoto {
  return {
    protocol: url.protocol.replace(":", "") as "http" | "https",
    hostname: url.hostname,
    port: url.port,
    pathname: caminho,
  };
}

// Imagem de produto vem do backend — diferente de dado de API (JSON), a URL da imagem É pública
// por natureza: o browser busca o <img>/next-image direto, sem passar pelo nosso servidor.
// next/image só otimiza host explicitamente liberado aqui:
// - BACKEND_URL: storage local do backend em dev (wwwroot/uploads, ArmazenamentoDeImagensLocal);
// - IMAGENS_URL_PUBLICA: Object Storage em staging/produção — o mesmo valor de Storage:UrlPublica
//   do backend (ex.: https://objectstorage.sa-saopaulo-1.oraclecloud.com/n/ns/b/bucket/o).
const backendUrl = process.env.BACKEND_URL ? new URL(process.env.BACKEND_URL) : undefined;
const imagensUrl = process.env.IMAGENS_URL_PUBLICA
  ? new URL(process.env.IMAGENS_URL_PUBLICA)
  : undefined;

// O otimizador do Next 16 recusa (400 "url parameter is not allowed") imagem vinda de IP local —
// proteção contra SSRF. Em dev o backend É local (localhost:5023), então libera só nesse caso:
// nunca em build de produção, e remotePatterns continua restringindo host/caminho.
const backendLocalEmDev =
  process.env.NODE_ENV === "development" &&
  !!backendUrl &&
  ["localhost", "127.0.0.1", "[::1]"].includes(backendUrl.hostname);

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: backendLocalEmDev,
    remotePatterns: [
      ...(backendUrl ? [padraoPara(backendUrl, "/uploads/**")] : []),
      ...(imagensUrl
        ? [padraoPara(imagensUrl, `${imagensUrl.pathname.replace(/\/$/, "")}/**`)]
        : []),
    ],
  },
};

export default nextConfig;
