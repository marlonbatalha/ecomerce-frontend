import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories, getCategoryBySlug, getProducts } from "@/lib/api/catalog";
import { ProductGrid } from "@/features/catalog/components/product-grid";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata(props: PageProps<"/categorias/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};

  return {
    title: category.name,
    description: category.description,
  };
}

export default async function CategoryPage(props: PageProps<"/categorias/[slug]">) {
  const { slug } = await props.params;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const { items: products } = await getProducts({ category: slug, pageSize: 24 });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {category.name}
        </h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">{category.description}</p>
      </header>

      <ProductGrid products={products} />
    </div>
  );
}
