import { cookies } from "next/headers";
import { COOKIE_QUANTIDADE_CARRINHO } from "@/lib/auth/cookies-publicos";
import { obterSessao } from "@/lib/auth/sessao";

/**
 * Identificação do carrinho nas chamadas à API. Logado: o access token (a API usa o carrinho do
 * usuário). Anônimo: um id aleatório guardado num cookie httpOnly deste frontend e repassado à API
 * como o cookie que ela espera (`idSessaoCarrinho`) — o browser nunca fala com a API, então o
 * cookie que a API criaria ficaria no domínio dela, inacessível aqui. No login, esse id vai junto
 * pra API mesclar o carrinho anônimo no do usuário.
 */

const COOKIE_SESSAO_CARRINHO = "carrinho_sessao";
const NOME_NA_API = "idSessaoCarrinho";
const TRINTA_DIAS_MS = 30 * 864e5;

export type IdentificacaoDoCarrinho = {
  token?: string;
  cabecalhos?: Record<string, string>;
};

function cabecalhoDaSessaoAnonima(id: string): Record<string, string> {
  return { Cookie: `${NOME_NA_API}=${encodeURIComponent(id)}` };
}

/** Pra leitura (Server Component): `null` quando ainda não existe carrinho nenhum (nada a buscar). */
export async function identificarCarrinho(): Promise<IdentificacaoDoCarrinho | null> {
  const sessao = await obterSessao();
  if (sessao) return { token: sessao.accessToken };

  const id = (await cookies()).get(COOKIE_SESSAO_CARRINHO)?.value;
  return id ? { cabecalhos: cabecalhoDaSessaoAnonima(id) } : null;
}

/** Pra escrita (Server Action): cria o carrinho anônimo na primeira vez. */
export async function identificarOuCriarCarrinho(): Promise<IdentificacaoDoCarrinho> {
  const existente = await identificarCarrinho();
  if (existente) return existente;

  const id = crypto.randomUUID().replaceAll("-", "");
  (await cookies()).set({
    name: COOKIE_SESSAO_CARRINHO,
    value: id,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(Date.now() + TRINTA_DIAS_MS),
  });
  return { cabecalhos: cabecalhoDaSessaoAnonima(id) };
}

/** Cookie do carrinho anônimo pra mandar no login/cadastro (a API mescla), ou `undefined`. */
export async function cabecalhoParaMesclarNoLogin(): Promise<Record<string, string> | undefined> {
  const id = (await cookies()).get(COOKIE_SESSAO_CARRINHO)?.value;
  return id ? cabecalhoDaSessaoAnonima(id) : undefined;
}

/** Depois da mescla o carrinho anônimo deixa de existir na API — o id local também. */
export async function esquecerCarrinhoAnonimo(): Promise<void> {
  (await cookies()).delete(COOKIE_SESSAO_CARRINHO);
}

/** Regrava a quantidade lida pelo ícone do carrinho (só Server Action — grava cookie). */
export async function gravarQuantidadeDoCarrinho(quantidade: number): Promise<void> {
  const loja = await cookies();
  if (quantidade <= 0) {
    loja.delete(COOKIE_QUANTIDADE_CARRINHO);
    return;
  }
  loja.set({
    name: COOKIE_QUANTIDADE_CARRINHO,
    value: String(quantidade),
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(Date.now() + TRINTA_DIAS_MS),
  });
}
