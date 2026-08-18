import type { Metadata } from "next";
import Link from "next/link";
import { getCategories, getProducts } from "@/lib/api/catalog";
import { ProductGrid } from "@/features/catalog/components/product-grid";

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
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {q ? `Resultados para "${q}"` : "Todos os produtos"}
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {total} {total === 1 ? "produto encontrado" : "produtos encontrados"}
        </p>
      </header>

      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href={buildHref(currentParams, { categoria: undefined })}
          className={`rounded-full border px-3 py-1 text-sm transition-colors ${
            !categoria
              ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-black"
              : "border-zinc-300 text-zinc-700 hover:border-zinc-500 dark:border-zinc-700 dark:text-zinc-300"
          }`}
        >
          Todas
        </Link>
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={buildHref(currentParams, { categoria: category.slug })}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              categoria === category.slug
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-black"
                : "border-zinc-300 text-zinc-700 hover:border-zinc-500 dark:border-zinc-700 dark:text-zinc-300"
            }`}
          >
            {category.name}
          </Link>
        ))}
      </div>

      <ProductGrid products={products} />
    </div>
  );
}
