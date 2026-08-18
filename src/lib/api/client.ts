/**
 * Cliente HTTP fino para a API própria (backend, repositório separado —
 * seção 1.7 do plano). Enquanto o backend não existe, as respostas vêm dos
 * handlers MSW (ver src/mocks): no browser via src/mocks/init.ts, e no
 * servidor (SSR/build) via src/instrumentation.ts.
 */

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly path: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function baseUrl(): string {
  // No browser, só variáveis NEXT_PUBLIC_* estão disponíveis. No servidor,
  // preferimos a URL interna (API_URL), que pode apontar para um host só
  // acessível de dentro da rede do backend.
  const url =
    typeof window === "undefined"
      ? (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL)
      : process.env.NEXT_PUBLIC_API_URL;

  if (!url) {
    throw new Error("API_URL/NEXT_PUBLIC_API_URL não configurada. Veja .env.example.");
  }
  return url;
}

export type ApiFetchOptions = Omit<RequestInit, "body"> & {
  searchParams?: Record<string, string | number | undefined>;
};

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { searchParams, ...init } = options;

  const url = new URL(path, baseUrl());
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...init.headers,
    },
  });

  if (!res.ok) {
    throw new ApiError(`Falha ao buscar ${path}: ${res.status}`, res.status, path);
  }

  return res.json() as Promise<T>;
}
