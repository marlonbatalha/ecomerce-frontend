import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  COOKIE_ACESSO,
  COOKIE_NOME,
  COOKIE_RENOVACAO,
  cookiesDaSessao,
  lerUsuarioDoToken,
  type TokensDaSessao,
  type UsuarioDoToken,
} from "@/lib/auth/tokens";

export type SessaoDoCliente = {
  accessToken: string;
  /** Token de renovação — só quem revoga a sessão (logout) precisa dele. */
  refreshToken?: string;
  usuario: UsuarioDoToken;
};

/**
 * Sessão atual, ou `null` se não houver access token válido. A renovação já aconteceu antes, no
 * `proxy.ts`; aqui só se lê. Usar só em renderização dinâmica / Server Action (lê cookies).
 */
export async function obterSessao(): Promise<SessaoDoCliente | null> {
  const loja = await cookies();
  const accessToken = loja.get(COOKIE_ACESSO)?.value;
  if (!accessToken) return null;

  const usuario = lerUsuarioDoToken(accessToken);
  if (!usuario || usuario.expiraEm.getTime() <= Date.now()) return null;

  return { accessToken, refreshToken: loja.get(COOKIE_RENOVACAO)?.value, usuario };
}

/** Como `obterSessao`, mas sem sessão manda pro login e volta pra `destino` depois. */
export async function exigirSessao(destino: string): Promise<SessaoDoCliente> {
  const sessao = await obterSessao();
  if (!sessao) redirect(`/entrar?redirecionar=${encodeURIComponent(destino)}`);
  return sessao;
}

/** Só em Server Action / Route Handler (Server Component não grava cookie). */
export async function gravarSessao(tokens: TokensDaSessao): Promise<void> {
  const loja = await cookies();
  for (const cookie of cookiesDaSessao(tokens)) loja.set(cookie);
}

export async function apagarSessao(): Promise<void> {
  const loja = await cookies();
  for (const nome of [COOKIE_ACESSO, COOKIE_RENOVACAO, COOKIE_NOME]) loja.delete(nome);
}
