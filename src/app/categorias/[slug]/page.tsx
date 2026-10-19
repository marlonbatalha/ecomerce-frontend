import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getProducts } from "@/lib/api/catalog";
import { ProductGrid } from "@/features/catalog/components/product-grid";
import { CatalogToolbar } from "@/features/catalog/components/catalog-toolbar";
import {
  lerParametrosDoCatalogo,
  montarLinkDoCatalogo,
  TAMANHO_PAGINA_CATALOGO,
} from "@/features/catalog/search-params";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Pagination } from "@/components/pagination";
import { PageHeader } from "@/components/ui/card";

export async function generateMetadata(props: PageProps<"/categorias/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};

  return {
    title: category.name,
    description: category.description,
  };
}

/**
 * Renderizada sob demanda (lê página/ordenação/preço da URL), não mais pré-gerada no build. O
 * custo é pequeno: os fetches continuam no cache do Next (ISR por URL da API, ver
 * `REVALIDATE_SECONDS` em `lib/api/catalog.ts`), só o HTML é montado a cada acesso.
 */
export default async function CategoryPage(props: PageProps<"/categorias/[slug]">) {
  const [{ slug }, searchParams] = await Promise.all([props.params, props.searchParams]);
  const filtros = lerParametrosDoCatalogo(searchParams);

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const resultado = await getProducts({
    category: slug,
    sort: filtros.sort,
    minPriceInCents: filtros.minPriceInCents,
    maxPriceInCents: filtros.maxPriceInCents,
    page: filtros.page,
    pageSize: TAMANHO_PAGINA_CATALOGO,
  });

  const caminho = `/categorias/${slug}`;
  const atuais = {
    ordem: filtros.sort,
    precoMin: searchParams.precoMin?.toString(),
    precoMax: searchParams.precoMax?.toString(),
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: category.name }]} />
      <PageHeader
        title={category.name}
        description={category.description}
        actions={
          <span className="text-sm text-muted-foreground">
            {resultado.total} {resultado.total === 1 ? "produto" : "produtos"}
          </span>
        }
      />

      <CatalogToolbar action={caminho} filtros={filtros} limparHref={caminho} />

      <ProductGrid products={resultado.items} />

      <Pagination
        page={filtros.page}
        totalPages={resultado.totalPages}
        hrefForPage={(pagina) => montarLinkDoCatalogo(caminho, atuais, { pagina: String(pagina) })}
      />
    </div>
  );
}
