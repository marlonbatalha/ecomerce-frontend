"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { mapearCarrinho, type CarrinhoApi } from "@/lib/api/carrinho";
import { cabecalhosDoVisitante } from "@/lib/api/client";
import type { EstadoDoFormulario } from "@/lib/api/conta-acoes";
import { chamarApi } from "@/lib/api/resposta";
import { exigirSessao } from "@/lib/auth/sessao";
import {
  gravarQuantidadeDoCarrinho,
  identificarOuCriarCarrinho,
} from "@/lib/carrinho/sessao-do-carrinho";

/**
 * Mudanças no carrinho (sempre na API — a fonte da verdade é o servidor) e a finalização da compra.
 * Toda mudança regrava o cookie de quantidade lido pelo ícone do carrinho.
 */

export type ResultadoDoCarrinho =
  { ok: true; quantidadeDeItens: number } | { ok: false; erro: string };

async function mudarCarrinho(
  caminho: string,
  metodo: "POST" | "PUT" | "DELETE",
  json?: unknown,
): Promise<ResultadoDoCarrinho> {
  const identificacao = await identificarOuCriarCarrinho();
  const resposta = await chamarApi<CarrinhoApi>(caminho, { ...identificacao, metodo, json });
  if (!resposta.ok) return { ok: false, erro: resposta.erro };

  const carrinho = mapearCarrinho(resposta.dados);
  await gravarQuantidadeDoCarrinho(carrinho.quantidadeDeItens);
  revalidatePath("/carrinho");
  revalidatePath("/checkout");
  return { ok: true, quantidadeDeItens: carrinho.quantidadeDeItens };
}

export async function adicionarAoCarrinho(
  varianteId: string,
  quantidade: number,
): Promise<ResultadoDoCarrinho> {
  return mudarCarrinho("/carrinho/itens", "POST", { varianteDeProdutoId: varianteId, quantidade });
}

export async function alterarQuantidade(
  varianteId: string,
  quantidade: number,
): Promise<ResultadoDoCarrinho> {
  if (quantidade <= 0) return removerDoCarrinho(varianteId);
  return mudarCarrinho(`/carrinho/itens/${encodeURIComponent(varianteId)}`, "PUT", { quantidade });
}

export async function removerDoCarrinho(varianteId: string): Promise<ResultadoDoCarrinho> {
  return mudarCarrinho(`/carrinho/itens/${encodeURIComponent(varianteId)}`, "DELETE");
}

export type ResultadoDoCupom =
  { ok: true; codigo: string; descontoInCents: number } | { ok: false; erro: string };

/** Prévia do desconto — o checkout recalcula tudo de novo na API (e é o que vale). */
export async function validarCupom(
  codigo: string,
  subtotalInCents: number,
): Promise<ResultadoDoCupom> {
  const normalizado = codigo.trim();
  if (!normalizado) return { ok: false, erro: "Digite o código do cupom." };

  // Cupom inválido/expirado/abaixo do mínimo vem como 400 { erro } (regra de domínio na API).
  const resposta = await chamarApi<{ codigo: string; descricao: string | null; desconto: number }>(
    "/cupons/validar",
    {
      metodo: "POST",
      json: { codigo: normalizado, subtotal: subtotalInCents / 100 },
      // Rate limit por visitante na API (evita testar códigos em massa).
      cabecalhos: await cabecalhosDoVisitante(),
    },
  );

  if (!resposta.ok) return { ok: false, erro: resposta.erro };
  return {
    ok: true,
    codigo: resposta.dados.codigo,
    descontoInCents: Math.round(resposta.dados.desconto * 100),
  };
}

type CheckoutApi = { pedido: { id: string }; urlPagamento: string | null };

export async function finalizarCompra(
  _anterior: EstadoDoFormulario,
  formData: FormData,
): Promise<EstadoDoFormulario> {
  const sessao = await exigirSessao("/checkout");
  const enderecoId = String(formData.get("enderecoId") ?? "");
  const metodoDeEnvio = String(formData.get("metodoDeEnvio") ?? "");
  const codigoCupom = String(formData.get("codigoCupom") ?? "").trim() || null;

  if (!enderecoId) return { erro: "Escolha o endereço de entrega." };
  if (!metodoDeEnvio) return { erro: "Escolha a forma de envio." };

  const resposta = await chamarApi<CheckoutApi>("/pedidos/checkout", {
    metodo: "POST",
    json: { enderecoId, metodoDeEnvio, codigoCupom },
    token: sessao.accessToken,
  });

  if (!resposta.ok) return { erro: resposta.erro };

  // O carrinho foi esvaziado pela API no checkout.
  await gravarQuantidadeDoCarrinho(0);
  revalidatePath("/carrinho");

  // Com Mercado Pago: segue pra pagar lá (Pix, cartão ou boleto — nenhum dado de pagamento passa
  // por aqui). Sem URL (gateway fake em dev, ou nada a cobrar): direto pra confirmação.
  redirect(
    resposta.dados.urlPagamento ??
      `/checkout/confirmacao?pedido=${encodeURIComponent(resposta.dados.pedido.id)}`,
  );
}
