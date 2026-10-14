"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { apiUrl } from "@/lib/api/client";
import { exigirTokenAdmin } from "@/lib/api/admin-auth";

/** Formato de erro da API própria: `{ erro }` pra regra de domínio (SKU duplicado, etc. — ver
 * ManipuladorDeExcecoesDeDominio no backend) ou `{ errors }` pro ValidationProblemDetails do
 * FluentValidation (campo obrigatório, etc.). */
async function extrairErro(res: Response): Promise<string> {
  try {
    const corpo = (await res.json()) as { erro?: string; errors?: Record<string, string[]> };
    if (corpo.erro) return corpo.erro;
    if (corpo.errors) return Object.values(corpo.errors).flat().join(" ");
  } catch {
    // Corpo não é JSON (ex.: 401 sem corpo) — cai no fallback abaixo.
  }
  return `Falha inesperada (${res.status}).`;
}

export type FormState = { error?: string; success?: boolean };

export async function criarCategoriaAdmin(
  _estadoAnterior: FormState,
  formData: FormData,
): Promise<FormState> {
  const token = await exigirTokenAdmin();
  const nome = String(formData.get("nome") ?? "").trim();

  if (!nome) return { error: "Nome é obrigatório." };

  const res = await fetch(apiUrl("/categorias"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ nome }),
  });

  if (res.status === 401) redirect("/admin/login");
  if (!res.ok) return { error: await extrairErro(res) };

  revalidatePath("/admin/categorias");
  revalidatePath("/admin/produtos/novo");
  revalidatePath("/produtos");
  return { success: true };
}

export type CriarProdutoState = { error?: string };

export async function criarProdutoAdmin(
  _estadoAnterior: CriarProdutoState,
  formData: FormData,
): Promise<CriarProdutoState> {
  const token = await exigirTokenAdmin();

  const nome = String(formData.get("nome") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim();
  const sku = String(formData.get("sku") ?? "").trim();
  const preco = Number(String(formData.get("preco") ?? "").replace(",", "."));
  const categoriaId = String(formData.get("categoriaId") ?? "");

  if (!nome || !sku || !categoriaId || !Number.isFinite(preco)) {
    return { error: "Preencha nome, SKU, preço e categoria." };
  }

  const res = await fetch(apiUrl("/produtos"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ nome, descricao, sku, preco, categoriaId }),
  });

  if (res.status === 401) redirect("/admin/login");
  if (!res.ok) return { error: await extrairErro(res) };

  const produto = (await res.json()) as { id: string };
  revalidatePath("/admin/produtos");
  redirect(`/admin/produtos/${produto.id}`);
}

export async function adicionarVarianteAdmin(
  produtoId: string,
  _estadoAnterior: FormState,
  formData: FormData,
): Promise<FormState> {
  const token = await exigirTokenAdmin();

  const nome = String(formData.get("nome") ?? "").trim();
  const sku = String(formData.get("sku") ?? "").trim();
  const preco = Number(String(formData.get("preco") ?? "").replace(",", "."));
  const estoque = Number(formData.get("estoque") ?? "");

  if (!nome || !sku || !Number.isFinite(preco) || !Number.isInteger(estoque)) {
    return { error: "Preencha nome, SKU, preço e estoque (número inteiro)." };
  }

  const res = await fetch(apiUrl(`/produtos/${produtoId}/variantes`), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ nome, sku, preco, estoque }),
  });

  if (res.status === 401) redirect("/admin/login");
  if (!res.ok) return { error: await extrairErro(res) };

  revalidatePath(`/admin/produtos/${produtoId}`);
  revalidatePath("/admin/produtos");
  revalidatePath("/produtos"); // pode passar a aparecer na busca pública agora
  return { success: true };
}

const TIPOS_ACEITOS = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function adicionarImagemAdmin(
  produtoId: string,
  _estadoAnterior: FormState,
  formData: FormData,
): Promise<FormState> {
  const token = await exigirTokenAdmin();
  const arquivo = formData.get("arquivo");

  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { error: "Selecione um arquivo de imagem." };
  }
  if (!TIPOS_ACEITOS.has(arquivo.type)) {
    return { error: "Formato não suportado — envie JPEG, PNG ou WebP." };
  }

  const corpo = new FormData();
  corpo.set("arquivo", arquivo);

  // Sem Content-Type manual — o fetch define o boundary do multipart/form-data sozinho a partir
  // do FormData; setar na mão quebra o boundary.
  const res = await fetch(apiUrl(`/produtos/${produtoId}/imagens`), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: corpo,
  });

  if (res.status === 401) redirect("/admin/login");
  if (!res.ok) return { error: await extrairErro(res) };

  revalidatePath(`/admin/produtos/${produtoId}`);
  revalidatePath("/produtos");
  return { success: true };
}

/** Lança em vez de devolver FormState: chamadas por botões de `<form action>` simples, sem
 * useActionState — falha cai no error boundary (raro: só se o produto/imagem sumiu no meio). */
async function enviarAlteracaoDeImagem(produtoId: string, caminho: string, init: RequestInit) {
  const token = await exigirTokenAdmin();

  const res = await fetch(apiUrl(`/produtos/${produtoId}${caminho}`), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
  });

  if (res.status === 401) redirect("/admin/login");
  if (!res.ok) throw new Error(await extrairErro(res));

  revalidatePath(`/admin/produtos/${produtoId}`);
  revalidatePath("/produtos");
}

export async function removerImagemAdmin(produtoId: string, imagemId: string): Promise<void> {
  await enviarAlteracaoDeImagem(produtoId, `/imagens/${imagemId}`, { method: "DELETE" });
}

/**
 * Move a imagem uma posição pra frente/trás (ou pro início, com "principal" — a primeira é a usada
 * na listagem da loja). A API recebe a ordem completa, então monta a lista nova a partir da atual.
 */
export async function moverImagemAdmin(
  produtoId: string,
  imagemId: string,
  direcao: "anterior" | "proxima" | "principal",
): Promise<void> {
  const produto = await obterProdutoAdmin(produtoId);
  if (!produto) throw new Error("Produto não encontrado.");

  const ids = [...produto.imagens].sort((a, b) => a.ordem - b.ordem).map((imagem) => imagem.id);
  const indice = ids.indexOf(imagemId);
  if (indice === -1) return;

  const destino =
    direcao === "principal"
      ? 0
      : direcao === "anterior"
        ? Math.max(0, indice - 1)
        : Math.min(ids.length - 1, indice + 1);
  if (destino === indice) return;

  ids.splice(indice, 1);
  ids.splice(destino, 0, imagemId);

  await enviarAlteracaoDeImagem(produtoId, "/imagens/ordem", {
    method: "PUT",
    body: JSON.stringify({ imagemIds: ids }),
  });
}

export type ProdutoAdminResumo = {
  id: string;
  nome: string;
  slug: string;
  sku: string;
  preco: number;
  categoriaId: string;
  ativo: boolean;
};

/** Lista TODO produto (inclui inativo/sem estoque) — `GET /api/v1/produtos` público esconde isso. */
export async function listarProdutosAdmin(): Promise<ProdutoAdminResumo[]> {
  const token = await exigirTokenAdmin();

  const res = await fetch(apiUrl("/produtos/admin?tamanhoPagina=100"), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (res.status === 401) redirect("/admin/login");
  if (!res.ok) throw new Error(`Falha ao listar produtos (${res.status}).`);

  const pagina = (await res.json()) as { itens: ProdutoAdminResumo[] };
  return pagina.itens;
}

export type ProdutoAdminDetalhe = {
  id: string;
  nome: string;
  slug: string;
  descricao: string;
  sku: string;
  preco: number;
  categoriaId: string;
  ativo: boolean;
  variantes: {
    id: string;
    nome: string;
    sku: string;
    preco: number;
    estoque: number;
    ativo: boolean;
  }[];
  imagens: { id: string; url: string; ordem: number }[];
};

/** `GET /api/v1/produtos/{id}` é público (não filtra por ativo) — não precisa de token aqui. */
export async function obterProdutoAdmin(id: string): Promise<ProdutoAdminDetalhe | null> {
  const res = await fetch(apiUrl(`/produtos/${id}`), { cache: "no-store" });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Falha ao buscar produto (${res.status}).`);

  return (await res.json()) as ProdutoAdminDetalhe;
}
