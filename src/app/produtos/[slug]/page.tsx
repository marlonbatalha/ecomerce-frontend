import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getCategoryBySlug,
  getProductBySlug,
  getProductSlugsForBuild,
  getProducts,
} from "@/lib/api/catalog";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { AddToCartForm } from "@/features/cart/components/add-to-cart-form";
import { ProductGallery } from "@/features/catalog/components/product-gallery";
import { ProductGrid } from "@/features/catalog/components/product-grid";

export async function generateStaticParams() {
  return (await getProductSlugsForBuild()).map((slug) => ({ slug }));
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
    image: product.images.length > 0 ? product.images.map((i) => i.url) : product.imageUrl,
    sku: product.variants[0]?.sku,
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
        <ProductGallery
          images={product.images}
          fallback={{ url: product.imageUrl, alt: product.imageAlt }}
        />

        <div className="flex flex-col">
          {category && (
            <p className="text-sm font-medium tracking-wide text-accent uppercase">
              {category.name}
            </p>
          )}
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance">
            {product.name}
          </h1>

          <AddToCartForm product={product} />

          <p className="mt-8 leading-relaxed text-pretty text-muted-foreground">
            {product.description}
          </p>
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
