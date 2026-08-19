import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getProductBySlug, getProducts } from "@/lib/api/catalog";
import { formatCurrency } from "@/lib/format";
import { ProductImage } from "@/components/product-image";
import { AddToCartForm } from "@/features/cart/components/add-to-cart-form";

export async function generateStaticParams() {
  const { items: products } = await getProducts({ pageSize: 100 });
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata(props: PageProps<"/produtos/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
    },
  };
}

export default async function ProductPage(props: PageProps<"/produtos/[slug]">) {
  const { slug } = await props.params;

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const category = await getCategoryBySlug(product.categorySlug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.imageUrl,
    offers: {
      "@type": "Offer",
      priceCurrency: "BRL",
      price: (product.priceInCents / 100).toFixed(2),
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      {category && (
        <nav className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
          <Link href={`/categorias/${category.slug}`} className="hover:underline">
            {category.name}
          </Link>
        </nav>
      )}

      <div className="grid gap-8 sm:grid-cols-2">
        <div className="relative aspect-square rounded-lg bg-zinc-100 dark:bg-zinc-900">
          <ProductImage
            src={product.imageUrl}
            alt={product.imageAlt}
            className="object-contain p-10"
            sizes="(min-width: 640px) 50vw, 100vw"
            priority
          />
        </div>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {product.name}
          </h1>
          <p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {formatCurrency(product.priceInCents)}
          </p>

          <p
            className={
              product.inStock
                ? "mt-2 text-sm font-medium text-green-700 dark:text-green-500"
                : "mt-2 text-sm font-medium text-red-700 dark:text-red-500"
            }
          >
            {product.inStock ? "Em estoque" : "Esgotado"}
          </p>

          <p className="mt-6 text-zinc-600 dark:text-zinc-400">{product.description}</p>

          <AddToCartForm product={product} />
        </div>
      </div>

      {/* Dados estruturados p/ SEO (schema.org Product) — seção 2.7 do plano. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
