import { apiUrl, cabecalhoDeConfianca } from "@/lib/api/url";

/**
 * Chamada à API que devolve o resultado em vez de lançar — pra Server Actions de formulário, que
 * precisam mostrar o erro da API ao usuário. A API responde erro em dois formatos:
 * `{ erro: "..." }` (regra de negócio/autenticação) e ValidationProblemDetails
 * (`{ errors: { Campo: ["..."] } }`, FluentValidation).
 */
export type RespostaDaApi<T> =
  | { ok: true; status: number; dados: T; resposta: Response }
  | { ok: false; status: number; erro: string; campos: Record<string, string> };

export type OpcoesDaChamada = {
  metodo?: "GET" | "POST" | "PUT" | "DELETE";
  json?: unknown;
  token?: string;
  cabecalhos?: Record<string, string>;
};

const ERRO_GENERICO = "Não deu pra concluir agora. Tente de novo em instantes.";

/** "NovaSenha" → "novaSenha": as chaves do ValidationProblemDetails vêm em PascalCase. */
function camelCase(campo: string): string {
  return campo ? campo[0].toLowerCase() + campo.slice(1) : campo;
}

/** Corpo vazio (204) ou não-JSON (página de erro de um proxy) → `undefined`. */
function lerJson(texto: string): unknown {
  try {
    return texto ? JSON.parse(texto) : undefined;
  } catch {
    return undefined;
  }
}

export async function chamarApi<T = unknown>(
  caminho: string,
  { metodo = "GET", json, token, cabecalhos }: OpcoesDaChamada = {},
): Promise<RespostaDaApi<T>> {
  let resposta: Response;
  try {
    resposta = await fetch(apiUrl(caminho), {
      method: metodo,
      cache: "no-store",
      body: json !== undefined ? JSON.stringify(json) : undefined,
      headers: {
        Accept: "application/json",
        ...cabecalhoDeConfianca(),
        ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...cabecalhos,
      },
    });
  } catch {
    return { ok: false, status: 0, erro: ERRO_GENERICO, campos: {} };
  }

  const corpo = lerJson(await resposta.clone().text());

  if (resposta.ok) {
    return { ok: true, status: resposta.status, dados: corpo as T, resposta };
  }

  if (resposta.status === 429) {
    return {
      ok: false,
      status: 429,
      erro: "Muitas tentativas. Aguarde um minuto e tente de novo.",
      campos: {},
    };
  }

  const erroDaApi = corpo as { erro?: string; errors?: Record<string, string[]> } | undefined;
  const campos = Object.fromEntries(
    Object.entries(erroDaApi?.errors ?? {}).map(([campo, mensagens]) => [
      camelCase(campo),
      mensagens[0] ?? "",
    ]),
  );

  return {
    ok: false,
    status: resposta.status,
    erro:
      erroDaApi?.erro ??
      (Object.keys(campos).length > 0 ? "Confira os campos destacados." : ERRO_GENERICO),
    campos,
  };
}
