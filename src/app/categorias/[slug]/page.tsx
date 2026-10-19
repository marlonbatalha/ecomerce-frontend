import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getCategorySlugsForBuild, getProducts } from "@/lib/api/catalog";
import { ProductGrid } from "@/features/catalog/components/product-grid";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { PageHeader } from "@/components/ui/card";

export async function generateStaticParams() {
  return (await getCategorySlugsForBuild()).map((slug) => ({ slug }));
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

  const { items: products, total } = await getProducts({ category: slug, pageSize: 24 });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: category.name }]} />
      <PageHeader
        title={category.name}
        description={category.description}
        actions={
          <span className="text-sm text-muted-foreground">
            {total} {total === 1 ? "produto" : "produtos"}
          </span>
        }
      />
      <ProductGrid products={products} />
    </div>
  );
}
