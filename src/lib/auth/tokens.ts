import { apiUrl, cabecalhoDeConfianca } from "@/lib/api/url";
import { COOKIE_NOME } from "@/lib/auth/cookies-publicos";

export { COOKIE_NOME };

/**
 * Sessão do cliente — tudo que não depende de `next/headers`, pra servir tanto ao `proxy.ts`
 * (que mexe nos cookies via NextRequest/NextResponse) quanto às Server Actions.
 *
 * Desenho (seção 2.10 do plano do frontend): o browser nunca fala com a API. O servidor do Next
 * guarda, em cookies httpOnly DO PRÓPRIO frontend, o access token (curto, ~15 min) e o refresh
 * token (7 dias). A API entrega o refresh token só via Set-Cookie (`refreshToken`, escopado ao
 * domínio dela) — aqui ele é lido desse cabeçalho e devolvido no `Cookie` da renovação.
 */

export const COOKIE_ACESSO = "sessao_acesso";
export const COOKIE_RENOVACAO = "sessao_renovacao";

/** Renova quando faltar menos que isso pro access token expirar. */
export const ANTECEDENCIA_RENOVACAO_MS = 60_000;

const CLAIM_PAPEL = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

export type TokensDaSessao = {
  accessToken: string;
  accessTokenExpiraEm: Date;
  refreshToken: string;
  refreshTokenExpiraEm: Date;
};

export type UsuarioDoToken = {
  id: string;
  email: string;
  nome: string;
  papeis: string[];
  expiraEm: Date;
};

/**
 * Lê o payload do JWT sem verificar a assinatura — seguro aqui porque o token só entra nos
 * cookies vindo direto da API, e é a API que valida a assinatura em toda chamada autenticada.
 * Serve só pra exibir nome/e-mail e saber quando renovar.
 */
export function lerUsuarioDoToken(token: string): UsuarioDoToken | null {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1] ?? "", "base64url").toString("utf8"),
    );
    const papeis = payload[CLAIM_PAPEL] ?? [];

    return {
      id: String(payload.sub ?? ""),
      email: String(payload.email ?? ""),
      nome: String(payload.nome ?? ""),
      papeis: Array.isArray(papeis) ? papeis : [papeis],
      expiraEm: new Date(Number(payload.exp) * 1000),
    };
  } catch {
    return null;
  }
}

export function precisaRenovar(token: string | undefined, agora = Date.now()): boolean {
  if (!token) return true;
  const usuario = lerUsuarioDoToken(token);
  return !usuario || usuario.expiraEm.getTime() - agora < ANTECEDENCIA_RENOVACAO_MS;
}

/** `refreshToken=<valor url-encoded>; expires=...; path=/; secure; samesite=none; httponly` → valor + expiração. */
function lerRefreshTokenDoSetCookie(resposta: Response): { valor: string; expiraEm: Date } | null {
  for (const cabecalho of resposta.headers.getSetCookie()) {
    const [par, ...atributos] = cabecalho.split(";");
    const separador = par.indexOf("=");
    if (par.slice(0, separador).trim() !== "refreshToken") continue;

    const valor = decodeURIComponent(par.slice(separador + 1).trim());
    const expires = atributos
      .map((a) => a.trim())
      .find((a) => a.toLowerCase().startsWith("expires="));
    const expiraEm = expires
      ? new Date(expires.slice("expires=".length))
      : new Date(Date.now() + 7 * 864e5);

    return valor ? { valor, expiraEm } : null;
  }
  return null;
}

/** Resposta OK de login/registro/renovação da API → tokens prontos pra virar cookies. */
export async function lerTokensDaResposta(resposta: Response): Promise<TokensDaSessao | null> {
  const corpo = (await resposta.json()) as {
    accessToken?: string;
    accessTokenExpiraEmUtc?: string;
  };
  const refresh = lerRefreshTokenDoSetCookie(resposta);
  if (!corpo.accessToken || !refresh) return null;

  // A API serializa DateTime UTC sem "Z" em alguns casos — o `exp` do próprio JWT é a fonte certa.
  const expiraEm =
    lerUsuarioDoToken(corpo.accessToken)?.expiraEm ?? new Date(Date.now() + 15 * 60_000);

  return {
    accessToken: corpo.accessToken,
    accessTokenExpiraEm: expiraEm,
    refreshToken: refresh.valor,
    refreshTokenExpiraEm: refresh.expiraEm,
  };
}

export type CookieDaSessao = {
  name: string;
  value: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  path: string;
  expires: Date;
};

/** Os três cookies da sessão, no formato aceito tanto por `cookies().set` quanto por `NextResponse.cookies.set`. */
export function cookiesDaSessao(tokens: TokensDaSessao): CookieDaSessao[] {
  const base = {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
  const primeiroNome = lerUsuarioDoToken(tokens.accessToken)?.nome.split(" ")[0] ?? "";

  return [
    {
      ...base,
      name: COOKIE_ACESSO,
      value: tokens.accessToken,
      httpOnly: true,
      expires: tokens.accessTokenExpiraEm,
    },
    {
      ...base,
      name: COOKIE_RENOVACAO,
      value: tokens.refreshToken,
      httpOnly: true,
      expires: tokens.refreshTokenExpiraEm,
    },
    // Expira junto com o refresh: enquanto houver sessão renovável, o cabeçalho mostra o nome.
    {
      ...base,
      name: COOKIE_NOME,
      value: encodeURIComponent(primeiroNome),
      httpOnly: false,
      expires: tokens.refreshTokenExpiraEm,
    },
  ];
}

export type ResultadoDaRenovacao =
  | { tipo: "renovado"; tokens: TokensDaSessao }
  /** Outra requisição acabou de renovar com o mesmo refresh token (API respondeu 409) — a sessão segue válida. */
  | { tipo: "concorrente" }
  /** Refresh token expirado, revogado ou desconhecido — a sessão acabou. */
  | { tipo: "invalido" }
  /** API fora do ar ou erro inesperado — não dá pra concluir nada, mantém os cookies. */
  | { tipo: "indisponivel" };

export async function renovarSessao(refreshToken: string): Promise<ResultadoDaRenovacao> {
  try {
    const resposta = await fetch(apiUrl("/auth/atualizar-token"), {
      method: "POST",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...cabecalhoDeConfianca(),
        Cookie: `refreshToken=${encodeURIComponent(refreshToken)}`,
      },
    });

    if (resposta.status === 409) return { tipo: "concorrente" };
    if (resposta.status === 401) return { tipo: "invalido" };
    if (!resposta.ok) return { tipo: "indisponivel" };

    const tokens = await lerTokensDaResposta(resposta);
    return tokens ? { tipo: "renovado", tokens } : { tipo: "indisponivel" };
  } catch {
    return { tipo: "indisponivel" };
  }
}

/**
 * Destino depois do login vindo da URL (`?redirecionar=`). Só caminho interno — senão vira
 * redirecionamento aberto (`?redirecionar=https://site-falso`), clássico de phishing.
 */
export function destinoSeguro(destino: string | null | undefined, padrao = "/conta"): string {
  if (
    !destino ||
    !destino.startsWith("/") ||
    destino.startsWith("//") ||
    destino.startsWith("/\\")
  ) {
    return padrao;
  }
  return destino;
}
