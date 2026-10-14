import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getProductBySlug, getProducts } from "@/lib/api/catalog";
import { formatCurrency } from "@/lib/format";
import { ProductImage } from "@/components/product-image";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { AddToCartForm } from "@/features/cart/components/add-to-cart-form";
import { ProductGrid } from "@/features/catalog/components/product-grid";

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

  const [category, { items: relacionados }] = await Promise.all([
    getCategoryBySlug(product.categorySlug),
    getProducts({ category: product.categorySlug, pageSize: 5 }),
  ]);
  const outrosDaCategoria = relacionados.filter((item) => item.id !== product.id).slice(0, 4);

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
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Breadcrumbs
        items={[
          { label: "Início", href: "/" },
          ...(category ? [{ label: category.name, href: `/categorias/${category.slug}` }] : []),
          { label: product.name },
        ]}
      />

      <div className="grid gap-8 md:grid-cols-2 lg:gap-14">
        <div className="relative aspect-square overflow-hidden rounded-3xl border border-border bg-surface-muted">
          <ProductImage
            src={product.imageUrl}
            alt={product.imageAlt}
            className="object-contain p-10 sm:p-14"
            sizes="(min-width: 768px) 50vw, 100vw"
            priority
          />
        </div>

        <div className="flex flex-col">
          {category && (
            <p className="text-sm font-medium tracking-wide text-accent uppercase">
              {category.name}
            </p>
          )}
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance">
            {product.name}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <p className="text-3xl font-semibold tracking-tight tabular-nums">
              {formatCurrency(product.priceInCents)}
            </p>
            <Badge tom={product.inStock ? "success" : "danger"}>
              {product.inStock ? "Em estoque" : "Esgotado"}
            </Badge>
          </div>

          <p className="mt-6 leading-relaxed text-pretty text-muted-foreground">
            {product.description}
          </p>

          <AddToCartForm product={product} />
        </div>
      </div>

      {outrosDaCategoria.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-5 text-xl font-semibold tracking-tight">Você também pode gostar</h2>
          <ProductGrid products={outrosDaCategoria} />
        </section>
      )}

      {/* Dados estruturados p/ SEO (schema.org Product) — seção 2.7 do plano. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
