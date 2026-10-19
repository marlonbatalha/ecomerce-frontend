/**
 * Endereço da API própria e identificação deste servidor. Separado de `client.ts` porque não
 * depende da requisição em andamento (`next/headers`): o `proxy.ts` também usa.
 */

/** Prefixo de versão da API própria — ver `[Route("api/v1/...")]` nos controllers do backend. */
const PREFIXO_API = "/api/v1";

function baseUrl(): string {
  // Só existe como variável server-side (sem prefixo NEXT_PUBLIC_) — não é
  // inlineada no bundle do cliente. Se isso rodar no browser (ver comentário
  // em client.ts), `process.env.BACKEND_URL` vem undefined e cai no
  // throw abaixo — falha alto e cedo em vez de vazar a URL do backend.
  const url = process.env.BACKEND_URL;

  if (!url) {
    throw new Error("BACKEND_URL não configurada. Veja .env.example.");
  }
  return url;
}

/**
 * Monta a URL completa de um endpoint da API própria — usado por `apiFetch` e por quem precisa de
 * mais controle sobre a resposta do que `apiFetch` dá (ex.: login, que precisa ler o corpo do erro
 * e o Set-Cookie em vez de só receber um `ApiError` genérico).
 */
export function apiUrl(path: string): URL {
  // new URL(path, base) descarta o path do base se `path` começar com "/" (é resolução de URL,
  // não concatenação de string) — por isso o prefixo de versão entra aqui, colado ao path
  // recebido, e não em BACKEND_URL (que fica só a origem, ex.: https://api.loja.com.br).
  return new URL(`${PREFIXO_API}${path}`, baseUrl());
}

/**
 * Identifica este servidor pra API própria (`Frontend:ChaveDeConfianca` no backend). Toda chamada
 * sai do servidor do Next, então a API veria sempre os mesmos IPs da Vercel e o rate limit dela
 * (por IP) viraria um limite único pra loja inteira. Com a chave, a API aceita o IP do visitante
 * enviado por `cabecalhosDoVisitante`, e chamadas sem visitante (ISR, build) não são limitadas.
 */
export function cabecalhoDeConfianca(): Record<string, string> {
  const chave = process.env.BACKEND_CHAVE_FRONTEND;
  return chave ? { "X-Frontend-Chave": chave } : {};
}
