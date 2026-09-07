import { apiFetch } from "@/lib/api/client";
import { mockingEnabled } from "@/lib/api/mocking";
import {
  findCategoryBySlug,
  findProductBySlug,
  listCategories,
  listProducts,
} from "@/mocks/data/catalog-queries";
import type { Category, Product, ProductListParams, ProductListResult } from "@/types/catalog";

// Tempos de revalidação (ISR) por tipo de dado — seção 3 do plano: páginas
// de catálogo priorizam SEO/performance, com dados atualizados em segundo
// plano. Busca (com `q`) não é cacheada: o resultado é específico da query.
const REVALIDATE_SECONDS = {
  categories: 3600,
  product: 300,
} as const;

/**
 * Quando o mock está ligado (NEXT_PUBLIC_API_MOCKING=enabled), as funções
 * abaixo leem direto de `src/mocks/data` em vez de fazer fetch — evita
 * depender de interceptação de rede (MSW) durante generateStaticParams e
 * outros contextos de build/SSR onde ela não é confiável. Ver o comentário
 * em `src/mocks/data/catalog-queries.ts`. O mock do browser (MSW,
 * `src/mocks/init.ts`) continua ativo para fetches feitos no cliente.
 *
 * Assim que a API própria estiver disponível, basta trocar a env var para
 * "disabled": nenhuma chamada de página muda.
 */

export function getCategories(): Promise<Category[]> {
  if (mockingEnabled()) return Promise.resolve(listCategories());

  return apiFetch<Category[]>("/categories", {
    next: { revalidate: REVALIDATE_SECONDS.categories },
  });
}

export function getCategoryBySlug(slug: string): Promise<Category | null> {
  if (mockingEnabled()) return Promise.resolve(findCategoryBySlug(slug));

  return apiFetch<Category>(`/categories/${slug}`, {
    next: { revalidate: REVALIDATE_SECONDS.categories },
  }).catch((err) => {
    if (err?.status === 404) return null;
    throw err;
  });
}

export function getProducts(params: ProductListParams = {}): Promise<ProductListResult> {
  if (mockingEnabled()) return Promise.resolve(listProducts(params));

  return apiFetch<ProductListResult>("/products", {
    searchParams: {
      category: params.category,
      q: params.q,
      page: params.page,
      pageSize: params.pageSize,
    },
    next: params.q ? { revalidate: 0 } : { revalidate: REVALIDATE_SECONDS.product },
  });
}

export function getProductBySlug(slug: string): Promise<Product | null> {
  if (mockingEnabled()) return Promise.resolve(findProductBySlug(slug));

  return apiFetch<Product>(`/products/${slug}`, {
    next: { revalidate: REVALIDATE_SECONDS.product },
  }).catch((err) => {
    if (err?.status === 404) return null;
    throw err;
  });
}
