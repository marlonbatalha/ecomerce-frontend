"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { buscarCarrinho } from "@/lib/api/carrinho";
import { cabecalhosDoVisitante } from "@/lib/api/client";
import { chamarApi } from "@/lib/api/resposta";
import { apagarSessao, exigirSessao, gravarSessao, obterSessao } from "@/lib/auth/sessao";
import {
  COOKIE_NOME,
  destinoSeguro,
  lerTokensDaResposta,
  type TokensDaSessao,
} from "@/lib/auth/tokens";
import {
  cabecalhoParaMesclarNoLogin,
  esquecerCarrinhoAnonimo,
  gravarQuantidadeDoCarrinho,
} from "@/lib/carrinho/sessao-do-carrinho";

/**
 * Server Actions da conta do cliente (login, cadastro, perfil, senha, endereços, pedidos). Cada uma
 * confere a sessão por conta própria — o `proxy.ts` só renova, não protege (ver "Data Security"
 * na doc do Next: matcher pode deixar uma action de fora sem ninguém perceber).
 */

export type EstadoDoFormulario = {
  erro?: string;
  /** Erro por campo (chave = `name` do input). */
  campos?: Record<string, string>;
  sucesso?: string;
  /** O React limpa o formulário depois da action — o que foi digitado volta por aqui (nunca senha). */
  valores?: Record<string, string>;
};

function texto(formData: FormData, campo: string): string {
  return String(formData.get(campo) ?? "").trim();
}

// --- Login, cadastro e logout -------------------------------------------------------------------

export async function entrar(
  _anterior: EstadoDoFormulario,
  formData: FormData,
): Promise<EstadoDoFormulario> {
  const email = texto(formData, "email");
  const senha = String(formData.get("senha") ?? "");
  const valores = { email };

  if (!email || !senha) return { erro: "Informe e-mail e senha.", valores };

  // Rate limit da API é por visitante: sem o IP dele, todo login viria do IP do servidor. O
  // carrinho anônimo vai junto pra API mesclar no carrinho da conta.
  const resposta = await chamarApi("/auth/login", {
    metodo: "POST",
    json: { email, senha },
    cabecalhos: { ...(await cabecalhosDoVisitante()), ...(await cabecalhoParaMesclarNoLogin()) },
  });

  if (!resposta.ok) {
    return {
      erro: resposta.status === 401 ? "E-mail ou senha inválidos." : resposta.erro,
      campos: resposta.campos,
      valores,
    };
  }

  const tokens = await lerTokensDaResposta(resposta.resposta);
  if (!tokens) return { erro: "Não deu pra entrar agora. Tente de novo.", valores };

  await iniciarSessao(tokens);
  redirect(destinoSeguro(texto(formData, "redirecionar")));
}

/**
 * Grava a sessão e acerta o carrinho: o anônimo já foi mesclado pela API no login/cadastro, então
 * o id local some, e o ícone passa a mostrar o carrinho da conta (que pode ter itens de outra visita).
 */
async function iniciarSessao(tokens: TokensDaSessao): Promise<void> {
  await gravarSessao(tokens);
  await esquecerCarrinhoAnonimo();
  try {
    const carrinho = await buscarCarrinho({ token: tokens.accessToken });
    await gravarQuantidadeDoCarrinho(carrinho.quantidadeDeItens);
  } catch {
    // Só o número do ícone; a página do carrinho busca de novo de qualquer jeito.
  }
}

export async function cadastrar(
  _anterior: EstadoDoFormulario,
  formData: FormData,
): Promise<EstadoDoFormulario> {
  const nome = texto(formData, "nome");
  const email = texto(formData, "email");
  const senha = String(formData.get("senha") ?? "");
  const valores = { nome, email };

  if (senha !== String(formData.get("confirmacao") ?? "")) {
    return {
      erro: "As senhas não conferem.",
      campos: { confirmacao: "Digite a mesma senha nos dois campos." },
      valores,
    };
  }

  const resposta = await chamarApi("/auth/registrar", {
    metodo: "POST",
    json: { nome, email, senha },
    cabecalhos: { ...(await cabecalhosDoVisitante()), ...(await cabecalhoParaMesclarNoLogin()) },
  });

  if (!resposta.ok) return { erro: resposta.erro, campos: resposta.campos, valores };

  const tokens = await lerTokensDaResposta(resposta.resposta);
  if (!tokens) redirect("/entrar");

  await iniciarSessao(tokens);
  redirect(destinoSeguro(texto(formData, "redirecionar")));
}

export async function sair(): Promise<void> {
  const sessao = await obterSessao();

  if (sessao) {
    // Revoga o refresh token na API — sem isso ele continuaria válido por 7 dias.
    await chamarApi("/auth/logout", {
      metodo: "POST",
      token: sessao.accessToken,
      cabecalhos: sessao.refreshToken
        ? { Cookie: `refreshToken=${encodeURIComponent(sessao.refreshToken)}` }
        : undefined,
    });
  }

  await apagarSessao();
  // O carrinho é da conta — deslogado, começa vazio (volta inteiro no próximo login).
  await gravarQuantidadeDoCarrinho(0);
  redirect("/");
}

// --- Perfil e senha -------------------------------------------------------------------------------

export async function atualizarDados(
  _anterior: EstadoDoFormulario,
  formData: FormData,
): Promise<EstadoDoFormulario> {
  const sessao = await exigirSessao("/conta/dados");
  const nome = texto(formData, "nome");

  const resposta = await chamarApi("/conta/perfil", {
    metodo: "PUT",
    json: { nome },
    token: sessao.accessToken,
  });
  if (!resposta.ok) return { erro: resposta.erro, campos: resposta.campos, valores: { nome } };

  // O nome no JWT só muda na próxima renovação; o cabeçalho lê este cookie. Sem `expires` ele
  // vira cookie de sessão do browser — a próxima renovação (proxy.ts) grava de novo com prazo.
  const loja = await cookies();
  if (loja.has(COOKIE_NOME)) {
    loja.set({
      name: COOKIE_NOME,
      value: encodeURIComponent(nome.split(" ")[0]),
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  revalidatePath("/conta", "layout");
  return { sucesso: "Dados atualizados.", valores: { nome } };
}

export async function trocarSenha(
  _anterior: EstadoDoFormulario,
  formData: FormData,
): Promise<EstadoDoFormulario> {
  const sessao = await exigirSessao("/conta/dados");
  const senhaAtual = String(formData.get("senhaAtual") ?? "");
  const novaSenha = String(formData.get("novaSenha") ?? "");

  if (novaSenha !== String(formData.get("confirmacao") ?? "")) {
    return {
      erro: "As senhas não conferem.",
      campos: { confirmacao: "Digite a mesma senha nos dois campos." },
    };
  }

  const resposta = await chamarApi("/conta/trocar-senha", {
    metodo: "POST",
    json: { senhaAtual, novaSenha },
    token: sessao.accessToken,
  });

  if (!resposta.ok) return { erro: resposta.erro, campos: resposta.campos };
  return { sucesso: "Senha alterada." };
}

// --- Endereços ------------------------------------------------------------------------------------

const CAMPOS_DO_ENDERECO = [
  "rotulo",
  "cep",
  "logradouro",
  "numero",
  "complemento",
  "bairro",
  "cidade",
  "estado",
] as const;

export async function salvarEndereco(
  _anterior: EstadoDoFormulario,
  formData: FormData,
): Promise<EstadoDoFormulario> {
  const sessao = await exigirSessao("/conta/enderecos");
  const id = texto(formData, "id");
  const valores = Object.fromEntries(
    CAMPOS_DO_ENDERECO.map((campo) => [campo, texto(formData, campo)]),
  );

  const resposta = await chamarApi<{ id: string }>(
    id ? `/conta/enderecos/${encodeURIComponent(id)}` : "/conta/enderecos",
    {
      metodo: id ? "PUT" : "POST",
      json: {
        ...valores,
        estado: valores.estado.toUpperCase(),
        complemento: valores.complemento || null,
      },
      token: sessao.accessToken,
    },
  );

  if (!resposta.ok) return { erro: resposta.erro, campos: resposta.campos, valores };

  // Cadastrado no meio do checkout: volta pra ele já com o endereço novo escolhido.
  if (texto(formData, "voltar") === "checkout") {
    redirect(`/checkout?endereco=${encodeURIComponent(resposta.dados.id)}`);
  }
  redirect("/conta/enderecos");
}

export async function removerEndereco(formData: FormData): Promise<void> {
  const sessao = await exigirSessao("/conta/enderecos");
  await chamarApi(`/conta/enderecos/${encodeURIComponent(texto(formData, "id"))}`, {
    metodo: "DELETE",
    token: sessao.accessToken,
  });
  revalidatePath("/conta/enderecos");
}

export async function tornarEnderecoPadrao(formData: FormData): Promise<void> {
  const sessao = await exigirSessao("/conta/enderecos");
  await chamarApi(`/conta/enderecos/${encodeURIComponent(texto(formData, "id"))}/padrao`, {
    metodo: "POST",
    token: sessao.accessToken,
  });
  revalidatePath("/conta/enderecos");
}

// --- Pedidos --------------------------------------------------------------------------------------

export async function cancelarPedido(
  _anterior: EstadoDoFormulario,
  formData: FormData,
): Promise<EstadoDoFormulario> {
  const id = texto(formData, "id");
  const sessao = await exigirSessao(`/conta/pedidos/${id}`);

  const resposta = await chamarApi(`/pedidos/${encodeURIComponent(id)}/cancelar`, {
    metodo: "POST",
    token: sessao.accessToken,
  });

  if (!resposta.ok) return { erro: resposta.erro };

  revalidatePath(`/conta/pedidos/${id}`);
  return { sucesso: "Pedido cancelado." };
}
