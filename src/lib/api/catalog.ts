import { apiFetch, cabecalhosDoVisitante } from "@/lib/api/client";
import type {
  Category,
  Product,
  ProductListItem,
  ProductListParams,
  ProductListResult,
  ProductSort,
} from "@/types/catalog";

// Tempos de revalidação (ISR) por tipo de dado — seção 3 do plano: páginas
// de catálogo priorizam SEO/performance, com dados atualizados em segundo
// plano. Busca (com `q`) não é cacheada: o resultado é específico da query.
const REVALIDATE_SECONDS = {
  categories: 3600,
  product: 300,
} as const;

const TAMANHO_MINIMO_TERMO = 2;
const TAMANHO_MAXIMO_TERMO = 100;

/** Placeholder local — não há storage/CDN real de imagem ainda (seção 1.4 do plano). */
const PLACEHOLDER_IMAGE = "/images/product-placeholder.svg";

/**
 * Catálogo fala direto com a API própria (`api/v1/categorias`, `api/v1/produtos`) — sem desvio
 * de mock, diferente de `orders.ts` (checkout continua mockado por enquanto, ver comentário lá).
 * O formato que a API devolve é bem diferente do que o resto do frontend consome
 * (`Category`/`Product`, em `src/types/catalog.ts`): português, categoria em árvore, preço em
 * decimal (não centavos), sem `categorySlug`/`imageAlt`/`inStock` prontos. Os tipos `*Api` abaixo
 * descrevem só os campos que a gente usa desse contrato; o resto do arquivo faz a tradução.
 */
type CategoriaApi = {
  id: string;
  nome: string;
  slug: string;
  subcategorias: CategoriaApi[];
};

type ProdutoResumoApi = {
  id: string;
  nome: string;
  slug: string;
  preco: number;
  categoriaId: string;
  imagemPrincipalUrl: string | null;
};

type VarianteApi = {
  id: string;
  nome: string;
  sku: string;
  preco: number;
  estoque: number;
  ativo: boolean;
};

type ProdutoApi = {
  id: string;
  nome: string;
  slug: string;
  descricao: string;
  preco: number;
  categoriaId: string;
  variantes: VarianteApi[];
  /** Já vem na ordem definida no admin (`Ordem`). */
  imagens: { url: string }[];
};

/** Nomes do enum `OrdenacaoProduto` do backend (o model binding aceita o nome). */
const ORDENACAO_API: Record<ProductSort, string> = {
  recentes: "MaisRecente",
  "menor-preco": "PrecoAsc",
  "maior-preco": "PrecoDesc",
};

type ResultadoPaginadoApi<T> = {
  itens: T[];
  pagina: number;
  tamanhoPagina: number;
  totalItens: number;
};

/**
 * Build (`next build`) não pode depender do backend estar no ar: são dois repositórios com deploy
 * independente, e o pre-commit/CI do frontend roda sem API nenhuma por perto. Se a API estiver
 * inalcançável (erro de rede — `fetch` rejeita com TypeError) durante o build, a listagem sai com
 * `fallback` e o ISR busca o dado real na primeira revalidação, já em runtime.
 *
 * Só no build, e só erro de rede: em runtime o erro continua subindo (o ISR mantém a última página
 * boa em vez de cachear uma vazia), e resposta de erro da API (`ApiError`) ou BACKEND_URL faltando
 * continuam quebrando o build — isso é bug/configuração errada, não API fora do ar.
 */
async function tolerarApiForaDoArNoBuild<T>(busca: Promise<T>, fallback: T): Promise<T> {
  try {
    return await busca;
  } catch (err) {
    if (process.env.NEXT_PHASE === "phase-production-build" && err instanceof TypeError) {
      console.warn("[catalogo] API inalcançável durante o build — seguindo com dados vazios.");
      return fallback;
    }
    throw err;
  }
}

function achatarCategorias(categorias: CategoriaApi[]): CategoriaApi[] {
  return categorias.flatMap((c) => [c, ...achatarCategorias(c.subcategorias)]);
}

function mapCategory(categoria: CategoriaApi): Category {
  return {
    id: categoria.id,
    slug: categoria.slug,
    name: categoria.nome,
    // A API própria não tem campo de descrição de categoria hoje.
    description: "",
  };
}

function buscarArvoreDeCategorias(): Promise<CategoriaApi[]> {
  return tolerarApiForaDoArNoBuild(
    apiFetch<CategoriaApi[]>("/categorias", {
      next: { revalidate: REVALIDATE_SECONDS.categories },
    }),
    [],
  );
}

/** Categoria não tem navegação pra slug no `ProdutoResumoApi`/`ProdutoApi` (só `categoriaId`) —
 * busca a árvore uma vez e monta os dois mapas (id->slug pro output, slug->id pro filtro). */
async function buscarMapasDeCategoria(): Promise<{
  porId: Map<string, string>;
  porSlug: Map<string, string>;
}> {
  const categorias = achatarCategorias(await buscarArvoreDeCategorias());

  return {
    porId: new Map(categorias.map((c) => [c.id, c.slug])),
    porSlug: new Map(categorias.map((c) => [c.slug, c.id])),
  };
}

/** A API própria devolve preço em decimal (ex.: 129.9) — o resto do frontend trabalha em centavos. */
function paraCentavos(preco: number): number {
  return Math.round(preco * 100);
}

function paraReais(centavos: number | undefined): string | undefined {
  return centavos === undefined ? undefined : (centavos / 100).toFixed(2);
}

/** Tamanhos de roupa na ordem em que a loja mostra (ordem alfabética daria G, GG, M, P...). */
const ORDEM_DE_TAMANHOS = ["PP", "P", "M", "G", "GG", "XG", "XGG", "EXG"];

/**
 * A API não guarda ordem de variante (nem devolve ordenado). Tamanhos de roupa conhecidos vêm
 * primeiro, na ordem certa; o resto em ordem natural ("38" antes de "40", "Azul" antes de "Preta").
 */
function compararVariantes(a: { nome: string }, b: { nome: string }): number {
  const tamanhoA = ORDEM_DE_TAMANHOS.indexOf(a.nome.trim().toUpperCase());
  const tamanhoB = ORDEM_DE_TAMANHOS.indexOf(b.nome.trim().toUpperCase());

  if (tamanhoA !== -1 && tamanhoB !== -1) return tamanhoA - tamanhoB;
  if (tamanhoA !== -1) return -1;
  if (tamanhoB !== -1) return 1;
  return a.nome.localeCompare(b.nome, "pt-BR", { numeric: true, sensitivity: "base" });
}

function totalDePaginas(totalItens: number, tamanhoPagina: number): number {
  return tamanhoPagina > 0 ? Math.ceil(totalItens / tamanhoPagina) : 0;
}

function resultadoVazio(params: ProductListParams): ProductListResult {
  return {
    items: [],
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20,
    total: 0,
    totalPages: 0,
  };
}

export async function getCategories(): Promise<Category[]> {
  return achatarCategorias(await buscarArvoreDeCategorias()).map(mapCategory);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const categoria = await apiFetch<CategoriaApi>(`/categorias/${slug}`, {
    next: { revalidate: REVALIDATE_SECONDS.categories },
  }).catch((err) => {
    if (err?.status === 404) return null;
    throw err;
  });

  return categoria ? mapCategory(categoria) : null;
}

export async function getProducts(params: ProductListParams = {}): Promise<ProductListResult> {
  const { porId, porSlug } = await buscarMapasDeCategoria();
  const categoriaId = params.category ? porSlug.get(params.category) : undefined;

  // Filtro por categoria com slug que não existe — resultado vazio, sem nem chamar a API.
  // A API recusa (400) termo fora de 2–100 caracteres (BuscarProdutosRequisicaoValidador no
  // backend): 1 letra não é uma busca útil, vira resultado vazio sem chamar a API.
  const termo = params.q?.trim().slice(0, TAMANHO_MAXIMO_TERMO) || undefined;

  if ((params.category && !categoriaId) || (termo && termo.length < TAMANHO_MINIMO_TERMO)) {
    return resultadoVazio(params);
  }

  const resultado = await tolerarApiForaDoArNoBuild(
    apiFetch<ResultadoPaginadoApi<ProdutoResumoApi>>("/produtos", {
      searchParams: {
        categoriaId,
        termo,
        ordenacao: params.sort ? ORDENACAO_API[params.sort] : undefined,
        precoMinimo: paraReais(params.minPriceInCents),
        precoMaximo: paraReais(params.maxPriceInCents),
        pagina: params.page,
        tamanhoPagina: params.pageSize,
      },
      // Busca com termo não é cacheada e a API limita por visitante — manda o IP dele. Sem termo
      // o resultado é cacheado (ISR) e compartilhado, então vai sem IP (ver cabecalhosDoVisitante).
      ...(termo
        ? { next: { revalidate: 0 }, headers: await cabecalhosDoVisitante() }
        : { next: { revalidate: REVALIDATE_SECONDS.product } }),
    }),
    { itens: [], pagina: params.page ?? 1, tamanhoPagina: params.pageSize ?? 20, totalItens: 0 },
  );

  const items: ProductListItem[] = resultado.itens.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.nome,
    priceInCents: paraCentavos(p.preco),
    categorySlug: porId.get(p.categoriaId) ?? "",
    imageUrl: p.imagemPrincipalUrl ?? PLACEHOLDER_IMAGE,
    imageAlt: p.nome,
    // GET /api/v1/produtos já filtra só produto ativo com variante ativa em estoque
    // (ver ProdutosController.Buscar, ApenasDisponiveis: true) — quem chega aqui está disponível.
    inStock: true,
  }));

  return {
    items,
    page: resultado.pagina,
    pageSize: resultado.tamanhoPagina,
    total: resultado.totalItens,
    totalPages: totalDePaginas(resultado.totalItens, resultado.tamanhoPagina),
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const produto = await apiFetch<ProdutoApi>(`/produtos/por-slug/${slug}`, {
    next: { revalidate: REVALIDATE_SECONDS.product },
  }).catch((err) => {
    if (err?.status === 404) return null;
    throw err;
  });

  if (!produto) return null;

  const { porId } = await buscarMapasDeCategoria();
  const variantesAtivas = produto.variantes.filter((v) => v.ativo).sort(compararVariantes);

  return {
    id: produto.id,
    slug: produto.slug,
    name: produto.nome,
    description: produto.descricao,
    priceInCents: paraCentavos(produto.preco),
    categorySlug: porId.get(produto.categoriaId) ?? "",
    imageUrl: produto.imagens[0]?.url ?? PLACEHOLDER_IMAGE,
    imageAlt: produto.nome,
    inStock: variantesAtivas.some((v) => v.estoque > 0),
    variants: variantesAtivas.map((v) => ({
      id: v.id,
      name: v.nome,
      sku: v.sku,
      priceInCents: paraCentavos(v.preco),
      stock: v.estoque,
    })),
    images: produto.imagens.map((imagem, indice) => ({
      url: imagem.url,
      alt: indice === 0 ? produto.nome : `${produto.nome} — foto ${indice + 1}`,
    })),
  };
}

/**
 * Slugs pra `generateStaticParams` das páginas de detalhe — só os 100 primeiros produtos; o resto
 * é gerado sob demanda. `no-store` de propósito: o cache de fetch do Next (`.next/cache`)
 * sobrevive entre builds, então com a API fora do ar uma lista cacheada mandaria pré-renderizar
 * páginas cujo detalhe não dá pra buscar — e aí não há fallback honesto (seria gravar um 404 pra
 * um produto que existe). Perguntando ao vivo, API fora do ar = nenhuma página de detalhe no
 * build; cada uma é gerada no primeiro acesso, em runtime.
 */
export async function getProductSlugsForBuild(): Promise<string[]> {
  const resultado = await tolerarApiForaDoArNoBuild(
    apiFetch<ResultadoPaginadoApi<ProdutoResumoApi>>("/produtos", {
      searchParams: { tamanhoPagina: 100 },
      cache: "no-store",
    }),
    { itens: [], pagina: 1, tamanhoPagina: 100, totalItens: 0 },
  );

  return resultado.itens.map((p) => p.slug);
}
