import { apiFetch } from "@/lib/api/client";
import type {
  Category,
  Product,
  ProductListItem,
  ProductListParams,
  ProductListResult,
} from "@/types/catalog";

// Tempos de revalidação (ISR) por tipo de dado — seção 3 do plano: páginas
// de catálogo priorizam SEO/performance, com dados atualizados em segundo
// plano. Busca (com `q`) não é cacheada: o resultado é específico da query.
const REVALIDATE_SECONDS = {
  categories: 3600,
  product: 300,
} as const;

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

type VarianteApi = { estoque: number; ativo: boolean };

type ProdutoApi = {
  id: string;
  nome: string;
  slug: string;
  descricao: string;
  preco: number;
  categoriaId: string;
  variantes: VarianteApi[];
  imagens: { url: string }[];
};

type ResultadoPaginadoApi<T> = {
  itens: T[];
  pagina: number;
  tamanhoPagina: number;
  totalItens: number;
};

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

/** Categoria não tem navegação pra slug no `ProdutoResumoApi`/`ProdutoApi` (só `categoriaId`) —
 * busca a árvore uma vez e monta os dois mapas (id->slug pro output, slug->id pro filtro). */
async function buscarMapasDeCategoria(): Promise<{
  porId: Map<string, string>;
  porSlug: Map<string, string>;
}> {
  const categorias = achatarCategorias(
    await apiFetch<CategoriaApi[]>("/categorias", {
      next: { revalidate: REVALIDATE_SECONDS.categories },
    }),
  );

  return {
    porId: new Map(categorias.map((c) => [c.id, c.slug])),
    porSlug: new Map(categorias.map((c) => [c.slug, c.id])),
  };
}

/** A API própria devolve preço em decimal (ex.: 129.9) — o resto do frontend trabalha em centavos. */
function paraCentavos(preco: number): number {
  return Math.round(preco * 100);
}

export async function getCategories(): Promise<Category[]> {
  const categorias = await apiFetch<CategoriaApi[]>("/categorias", {
    next: { revalidate: REVALIDATE_SECONDS.categories },
  });

  return achatarCategorias(categorias).map(mapCategory);
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
  if (params.category && !categoriaId) {
    return { items: [], page: params.page ?? 1, pageSize: params.pageSize ?? 20, total: 0 };
  }

  const resultado = await apiFetch<ResultadoPaginadoApi<ProdutoResumoApi>>("/produtos", {
    searchParams: {
      categoriaId,
      termo: params.q,
      pagina: params.page,
      tamanhoPagina: params.pageSize,
    },
    next: params.q ? { revalidate: 0 } : { revalidate: REVALIDATE_SECONDS.product },
  });

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

  return {
    id: produto.id,
    slug: produto.slug,
    name: produto.nome,
    description: produto.descricao,
    priceInCents: paraCentavos(produto.preco),
    categorySlug: porId.get(produto.categoriaId) ?? "",
    imageUrl: produto.imagens[0]?.url ?? PLACEHOLDER_IMAGE,
    imageAlt: produto.nome,
    inStock: produto.variantes.some((v) => v.ativo && v.estoque > 0),
  };
}
