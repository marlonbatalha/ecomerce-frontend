import type { Metadata } from "next";
import Link from "next/link";
import { getCategories, getProducts } from "@/lib/api/catalog";
import { ProductGrid } from "@/features/catalog/components/product-grid";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { PageHeader } from "@/components/ui/card";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Produtos",
};

function buildHref(base: URLSearchParams, overrides: Record<string, string | undefined>) {
  const params = new URLSearchParams(base);
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) params.delete(key);
    else params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `/produtos?${qs}` : "/produtos";
}

function chipClasses(ativo: boolean) {
  return cn(
    "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
    ativo
      ? "border-primary bg-primary text-primary-foreground"
      : "border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground",
  );
}

export default async function ProductsPage(props: PageProps<"/produtos">) {
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const categoria = typeof searchParams.categoria === "string" ? searchParams.categoria : undefined;

  const [categories, { items: products, total }] = await Promise.all([
    getCategories(),
    getProducts({ q, category: categoria, pageSize: 24 }),
  ]);

  const currentParams = new URLSearchParams();
  if (q) currentParams.set("q", q);
  if (categoria) currentParams.set("categoria", categoria);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: "Produtos" }]} />
      <PageHeader
        title={q ? `Resultados para "${q}"` : "Todos os produtos"}
        description={`${total} ${total === 1 ? "produto encontrado" : "produtos encontrados"}`}
        actions={
          q ? (
            <Link
              href={buildHref(currentParams, { q: undefined })}
              className="text-sm font-medium text-accent hover:text-accent-hover"
            >
              Limpar busca
            </Link>
          ) : undefined
        }
      />

      <div
        role="group"
        aria-label="Filtrar por categoria"
        className="-mx-4 mb-8 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
      >
        <Link
          href={buildHref(currentParams, { categoria: undefined })}
          aria-current={!categoria ? "true" : undefined}
          className={chipClasses(!categoria)}
        >
          Todas
        </Link>
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={buildHref(currentParams, { categoria: category.slug })}
            aria-current={categoria === category.slug ? "true" : undefined}
            className={chipClasses(categoria === category.slug)}
          >
            {category.name}
          </Link>
        ))}
      </div>

      <ProductGrid products={products} />
    </div>
  );
}
