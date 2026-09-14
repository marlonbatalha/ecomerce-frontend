"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiUrl } from "@/lib/api/client";

/**
 * Sessão do admin: guarda só o access token da API própria num cookie httpOnly do PRÓPRIO
 * frontend (nunca um cookie do backend — o refresh token que a API própria seta via Set-Cookie
 * em `/api/v1/auth/login` é `SameSite=None; Secure`, escopado ao domínio do backend; não faz
 * sentido repassar isso pro browser já que o browser nunca fala com o backend direto). Sem
 * refresh: quando o access token expirar (~15min, ver Jwt:MinutosExpiracaoAccessToken no
 * backend), a próxima ação admin recebe 401 e manda logar de novo — aceitável pra uma ferramenta
 * interna de baixo tráfego; renovação automática fica pra quando/se isso crescer.
 */
const COOKIE_SESSAO_ADMIN = "admin_session";

type RespostaLogin = { accessToken: string; accessTokenExpiraEmUtc: string };

/** Decodifica o payload do JWT sem verificar assinatura — seguro aqui porque o token acabou de
 * vir direto da própria API (BACKEND_URL), nunca de uma fonte não confiável. */
function decodificarPapeis(token: string): string[] {
  const payloadBase64Url = token.split(".")[1];
  if (!payloadBase64Url) return [];

  const base64 = payloadBase64Url.replace(/-/g, "+").replace(/_/g, "/");
  const payload = JSON.parse(Buffer.from(base64, "base64").toString("utf8"));

  const papeis = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
  if (!papeis) return [];
  return Array.isArray(papeis) ? papeis : [papeis];
}

export type LoginState = { error?: string };

export async function loginAdmin(
  _estadoAnterior: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const senha = String(formData.get("senha") ?? "");

  if (!email || !senha) {
    return { error: "Informe e-mail e senha." };
  }

  const res = await fetch(apiUrl("/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });

  if (!res.ok) {
    if (res.status === 401) return { error: "E-mail ou senha inválidos." };
    return { error: `Não deu pra entrar agora (erro ${res.status}).` };
  }

  const dados = (await res.json()) as RespostaLogin;
  const papeis = decodificarPapeis(dados.accessToken);

  if (!papeis.includes("admin")) {
    return { error: "Essa conta não tem permissão de admin." };
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_SESSAO_ADMIN, dados.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    expires: new Date(dados.accessTokenExpiraEmUtc),
  });

  redirect("/admin");
}

export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_SESSAO_ADMIN);
  redirect("/admin/login");
}

/** Usado pelas Server Actions de mutação (criar categoria/produto/variante) — redireciona pro
 * login se a sessão não existir ou já tiver expirado (cookie apagado por segurança nesse caso). */
export async function exigirTokenAdmin(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_SESSAO_ADMIN)?.value;

  if (!token) {
    redirect("/admin/login");
  }

  return token;
}
