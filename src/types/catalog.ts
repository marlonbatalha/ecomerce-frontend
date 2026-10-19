/**
 * Contratos de dados do domínio de catálogo, já traduzidos do formato da API própria
 * (português, preço decimal) pelo `src/lib/api/catalog.ts` — ver seção 1.7 do plano.
 */

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
};

/** Variação vendável do produto (tamanho, cor...) — é ela que vai pro carrinho, não o produto. */
export type ProductVariant = {
  id: string;
  name: string;
  sku: string;
  priceInCents: number;
  stock: number;
};

export type ProductImageData = {
  url: string;
  alt: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  /** Preço em centavos, para evitar erro de ponto flutuante. */
  priceInCents: number;
  categorySlug: string;
  /** URL da imagem principal (placeholder local quando o produto não tem imagem). */
  imageUrl: string;
  imageAlt: string;
  inStock: boolean;
  /** Só as variantes ativas — inativa não aparece na loja. */
  variants: ProductVariant[];
  /** Na ordem definida no admin; vazio quando o produto não tem imagem. */
  images: ProductImageData[];
};

export type ProductListItem = Pick<
  Product,
  "id" | "slug" | "name" | "priceInCents" | "categorySlug" | "imageUrl" | "imageAlt" | "inStock"
>;

export type ProductSort = "recentes" | "menor-preco" | "maior-preco";

export type ProductListParams = {
  category?: string;
  q?: string;
  sort?: ProductSort;
  minPriceInCents?: number;
  maxPriceInCents?: number;
  page?: number;
  pageSize?: number;
};

export type ProductListResult = {
  items: ProductListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};
