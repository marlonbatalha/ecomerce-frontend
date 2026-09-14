/**
 * Cliente HTTP fino para a API própria (backend, repositório separado —
 * seção 1.7 do plano). Enquanto o backend não existe, cada módulo em
 * `src/lib/api` lê direto de `src/mocks/data` quando
 * NEXT_PUBLIC_API_MOCKING=enabled (ver comentário em
 * src/mocks/data/catalog-queries.ts) em vez de chamar `apiFetch` — não dá
 * pra confiar em interceptação de rede (MSW) em todo processo que o Next
 * usa durante build/SSR.
 *
 * `apiFetch` só roda no servidor (Server Components, Route Handlers, Server
 * Actions) — de propósito, não por acaso: a URL do backend (BACKEND_URL)
 * nunca é exposta ao browser. Se algum dia um client component precisar
 * chamar a API própria diretamente, a chamada tem que passar por uma Server
 * Action (ver `"use server"` em src/lib/api/orders.ts) — nunca usar
 * NEXT_PUBLIC_* pra isso, ou a URL real do backend (host do App
 * Service/VM em produção) vaza no bundle do cliente.
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

/** Prefixo de versão da API própria — ver `[Route("api/v1/...")]` nos controllers do backend. */
const PREFIXO_API = "/api/v1";

function baseUrl(): string {
  // Só existe como variável server-side (sem prefixo NEXT_PUBLIC_) — não é
  // inlineada no bundle do cliente. Se isso rodar no browser (ver comentário
  // no topo do arquivo), `process.env.BACKEND_URL` vem undefined e cai no
  // throw abaixo — falha alto e cedo em vez de vazar a URL do backend.
  const url = process.env.BACKEND_URL;

  if (!url) {
    throw new Error("BACKEND_URL não configurada. Veja .env.example.");
  }
  return url;
}

/**
 * Monta a URL completa de um endpoint da API própria — usado por `apiFetch` e por quem precisa de
 * mais controle sobre a resposta do que `apiFetch` dá (ex.: login em `admin-auth.ts`, que precisa
 * ler o corpo do erro em vez de só receber um `ApiError` genérico).
 */
export function apiUrl(path: string): URL {
  // new URL(path, base) descarta o path do base se `path` começar com "/" (é resolução de URL,
  // não concatenação de string) — por isso o prefixo de versão entra aqui, colado ao path
  // recebido, e não em BACKEND_URL (que fica só a origem, ex.: https://api.loja.com.br).
  return new URL(`${PREFIXO_API}${path}`, baseUrl());
}

export type ApiFetchOptions = Omit<RequestInit, "body"> & {
  searchParams?: Record<string, string | number | undefined>;
  /** Serializado como JSON e enviado com `Content-Type: application/json`. */
  json?: unknown;
};

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { searchParams, json, ...init } = options;

  const url = apiUrl(path);
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const res = await fetch(url, {
    ...init,
    body: json !== undefined ? JSON.stringify(json) : undefined,
    headers: {
      Accept: "application/json",
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });

  if (!res.ok) {
    throw new ApiError(`Falha ao buscar ${path}: ${res.status}`, res.status, path);
  }

  return res.json() as Promise<T>;
}
