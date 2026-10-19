import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_QUANTIDADE_CARRINHO } from "@/lib/auth/cookies-publicos";
import {
  COOKIE_ACESSO,
  COOKIE_NOME,
  COOKIE_RENOVACAO,
  cookiesDaSessao,
  precisaRenovar,
  renovarSessao,
} from "@/lib/auth/tokens";

/**
 * Renova a sessão do cliente antes da página renderizar. Precisa ser aqui (e não na página): Server
 * Component não pode gravar cookie, então uma página que descobrisse o access token vencido não
 * teria como salvar o novo. O token renovado vai na resposta (pro browser) e também no `Cookie`
 * da própria requisição (pra página que vai renderizar agora já enxergá-lo).
 *
 * Só age quando há refresh token e o access token vence em menos de 1 min — o resto passa direto.
 */
export async function proxy(request: NextRequest) {
  const refreshToken = request.cookies.get(COOKIE_RENOVACAO)?.value;
  if (!refreshToken || !precisaRenovar(request.cookies.get(COOKIE_ACESSO)?.value)) {
    return NextResponse.next();
  }

  // Prefetch dispara várias requisições em paralelo — renovar em todas multiplicaria as chamadas
  // concorrentes à API. A navegação de verdade renova.
  if (ehPrefetch(request)) return NextResponse.next();

  const resultado = await renovarSessao(refreshToken);

  if (resultado.tipo === "renovado") {
    const cookies = cookiesDaSessao(resultado.tokens);
    for (const cookie of cookies) request.cookies.set(cookie.name, cookie.value);

    const resposta = NextResponse.next({ request: { headers: request.headers } });
    for (const cookie of cookies) resposta.cookies.set(cookie);
    return resposta;
  }

  if (resultado.tipo === "invalido") {
    // A quantidade no ícone era a do carrinho da conta — sem sessão, não vale mais.
    const nomes = [COOKIE_ACESSO, COOKIE_RENOVACAO, COOKIE_NOME, COOKIE_QUANTIDADE_CARRINHO];
    for (const nome of nomes) request.cookies.delete(nome);

    const resposta = NextResponse.next({ request: { headers: request.headers } });
    for (const nome of nomes) resposta.cookies.delete(nome);
    return resposta;
  }

  // "concorrente" (outra requisição já renovou — os cookies novos chegam por ela) ou
  // "indisponivel" (API fora do ar): não mexe em nada.
  return NextResponse.next();
}

function ehPrefetch(request: NextRequest): boolean {
  return (
    request.headers.has("next-router-prefetch") ||
    request.headers.get("purpose") === "prefetch" ||
    request.headers.get("sec-purpose")?.includes("prefetch") === true
  );
}

export const config = {
  // Páginas e Server Actions; fora: assets do Next, imagens otimizadas e arquivos com extensão.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.[a-zA-Z0-9]+$).*)"],
};
