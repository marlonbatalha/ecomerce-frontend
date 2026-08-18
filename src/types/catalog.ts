/**
 * Contratos de dados do domínio de catálogo. Espelham o que a API própria
 * (backend, repositório separado) deve expor — ver seção 1.7 do plano.
 * Mantidos independentes de como os dados chegam (fetch real ou mock).
 */

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  /** Preço em centavos, para evitar erro de ponto flutuante. */
  priceInCents: number;
  categorySlug: string;
  /** URL da imagem principal (placeholder local até haver storage real). */
  imageUrl: string;
  imageAlt: string;
  inStock: boolean;
};

export type ProductListItem = Pick<
  Product,
  "id" | "slug" | "name" | "priceInCents" | "categorySlug" | "imageUrl" | "imageAlt" | "inStock"
>;

export type ProductListParams = {
  category?: string;
  q?: string;
  page?: number;
  pageSize?: number;
};

export type ProductListResult = {
  items: ProductListItem[];
  page: number;
  pageSize: number;
  total: number;
};
