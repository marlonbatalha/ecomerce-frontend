/**
 * Cliente HTTP fino para a API própria (backend, repositório separado —
 * seção 1.7 do plano). Todo dado vem da API de verdade (sem mock).
 *
 * `apiFetch` só roda no servidor (Server Components, Route Handlers, Server
 * Actions) — de propósito, não por acaso: a URL do backend (BACKEND_URL)
 * nunca é exposta ao browser. Se algum dia um client component precisar
 * chamar a API própria diretamente, a chamada tem que passar por uma Server
 * Action (ver `"use server"` em src/lib/api/carrinho-acoes.ts) — nunca usar
 * NEXT_PUBLIC_* pra isso, ou a URL real do backend (host do App
 * Service/VM em produção) vaza no bundle do cliente.
 */

import { headers } from "next/headers";
import { apiUrl, cabecalhoDeConfianca } from "@/lib/api/url";

export { apiUrl, cabecalhoDeConfianca };

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

/**
 * Chave + IP do visitante, pra chamadas que a API limita por pessoa (busca com termo, login).
 * Usa `headers()`: só chamar em renderização dinâmica ou Server Action, nunca num fetch cacheado
 * (ISR). A página passaria a ser dinâmica e o IP de um visitante iria parar no cache.
 * Na Vercel, `x-real-ip`/`x-forwarded-for` são preenchidos pela própria plataforma; fora dela, o
 * browser consegue forjar esses headers.
 */
export async function cabecalhosDoVisitante(): Promise<Record<string, string>> {
  const recebidos = await headers();
  const ip = recebidos.get("x-real-ip") ?? recebidos.get("x-forwarded-for")?.split(",")[0]?.trim();

  return { ...cabecalhoDeConfianca(), ...(ip ? { "X-Cliente-IP": ip } : {}) };
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
      ...cabecalhoDeConfianca(),
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });

  if (!res.ok) {
    throw new ApiError(`Falha ao buscar ${path}: ${res.status}`, res.status, path);
  }

  return res.json() as Promise<T>;
}
