import { categories, products } from "@/mocks/data/catalog";
import type {
  Category,
  Product,
  ProductListItem,
  ProductListParams,
  ProductListResult,
} from "@/types/catalog";

/**
 * Lógica de consulta sobre os dados mockados — fonte única de verdade
 * usada tanto pelos handlers MSW (`src/mocks/handlers/catalog.ts`, para o
 * mock no browser e nos testes) quanto diretamente pelo cliente de API
 * (`src/lib/api/catalog.ts`, quando NEXT_PUBLIC_API_MOCKING=enabled).
 *
 * Motivo de existir separado dos handlers: interceptar fetch com MSW não é
 * confiável em todo processo/worker que o Next usa durante `next build`
 * (ex.: coleta de dados de generateStaticParams roda fora do processo do
 * servidor, sem passar pelo instrumentation.ts) — então o código de página
 * consulta esta camada direto, sem depender de rede/interceptação.
 */

const DEFAULT_PAGE_SIZE = 12;

function toListItem(product: Product): ProductListItem {
  const { id, slug, name, priceInCents, categorySlug, imageUrl, imageAlt, inStock } = product;
  return { id, slug, name, priceInCents, categorySlug, imageUrl, imageAlt, inStock };
}

export function listCategories(): Category[] {
  return categories;
}

export function findCategoryBySlug(slug: string): Category | null {
  return categories.find((c) => c.slug === slug) ?? null;
}

export function listProducts(params: ProductListParams = {}): ProductListResult {
  const { category, q, page = 1, pageSize = DEFAULT_PAGE_SIZE } = params;

  let filtered = products;
  if (category) {
    filtered = filtered.filter((p) => p.categorySlug === category);
  }
  if (q) {
    const needle = q.trim().toLowerCase();
    filtered = filtered.filter(
      (p) => p.name.toLowerCase().includes(needle) || p.description.toLowerCase().includes(needle),
    );
  }

  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize).map(toListItem);

  return { items, page, pageSize, total: filtered.length };
}

export function findProductBySlug(slug: string): Product | null {
  return products.find((p) => p.slug === slug) ?? null;
}
