import Link from "next/link";
import { getCategories, getProducts } from "@/lib/api/catalog";
import { ProductGrid } from "@/features/catalog/components/product-grid";
import { ArrowRightIcon, ChevronRightIcon } from "@/components/icons";
import { buttonClasses } from "@/components/ui/button";

export default async function HomePage() {
  const [{ items: products }, categories] = await Promise.all([
    getProducts({ pageSize: 8 }),
    getCategories(),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-surface px-6 py-14 sm:px-12 sm:py-20">
        <div className="relative max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Tudo o que você precisa, num só lugar
          </h1>
          <p className="mt-4 max-w-xl text-lg text-pretty text-muted-foreground">
            Eletrônicos, casa e decoração, moda e esporte — com entrega rápida e preço justo.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/produtos" className={buttonClasses({ tamanho: "lg" })}>
              Ver produtos
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            {categories[0] && (
              <Link
                href={`/categorias/${categories[0].slug}`}
                className={buttonClasses({ variante: "outline", tamanho: "lg" })}
              >
                Explorar {categories[0].name}
              </Link>
            )}
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl font-semibold tracking-tight">Compre por categoria</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/categorias/${category.slug}`}
                aria-label={`Categoria ${category.name}`}
                className="group flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-border-strong hover:shadow-elevated"
              >
                <span className="font-semibold">{category.name}</span>
                <span className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {category.description}
                </span>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-accent">
                  Ver produtos
                  <ChevronRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-14">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Produtos em destaque</h2>
          <Link
            href="/produtos"
            className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-hover"
          >
            Ver tudo
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
        </div>
        <ProductGrid products={products} />
      </section>
    </div>
  );
}
