import type { Metadata } from "next";
import Link from "next/link";
import { getCategories, getProducts } from "@/lib/api/catalog";
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
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Produtos",
};

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
  const filtros = lerParametrosDoCatalogo(searchParams);

  const [categories, resultado] = await Promise.all([
    getCategories(),
    getProducts({
      q,
      category: categoria,
      sort: filtros.sort,
      minPriceInCents: filtros.minPriceInCents,
      maxPriceInCents: filtros.maxPriceInCents,
      page: filtros.page,
      pageSize: TAMANHO_PAGINA_CATALOGO,
    }),
  ]);

  // Estado atual da URL, como texto — base de todo link desta página (chips, paginação, limpar).
  const atuais = {
    q,
    categoria,
    ordem: filtros.sort,
    precoMin: searchParams.precoMin?.toString(),
    precoMax: searchParams.precoMax?.toString(),
  };
  const link = (alteracoes: Record<string, string | undefined>) =>
    montarLinkDoCatalogo("/produtos", atuais, alteracoes);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: "Produtos" }]} />
      <PageHeader
        title={q ? `Resultados para "${q}"` : "Todos os produtos"}
        description={`${resultado.total} ${resultado.total === 1 ? "produto encontrado" : "produtos encontrados"}`}
        actions={
          q ? (
            <Link
              href={link({ q: undefined, pagina: undefined })}
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
        className="-mx-4 mb-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
      >
        <Link
          href={link({ categoria: undefined, pagina: undefined })}
          aria-current={!categoria ? "true" : undefined}
          className={chipClasses(!categoria)}
        >
          Todas
        </Link>
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={link({ categoria: category.slug, pagina: undefined })}
            aria-current={categoria === category.slug ? "true" : undefined}
            className={chipClasses(categoria === category.slug)}
          >
            {category.name}
          </Link>
        ))}
      </div>

      <CatalogToolbar
        action="/produtos"
        filtros={filtros}
        manter={{ q, categoria }}
        limparHref={montarLinkDoCatalogo("/produtos", { q, categoria })}
      />

      <ProductGrid products={resultado.items} />

      <Pagination
        page={filtros.page}
        totalPages={resultado.totalPages}
        hrefForPage={(pagina) => link({ pagina: String(pagina) })}
      />
    </div>
  );
}
