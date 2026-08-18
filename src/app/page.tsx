import { getProducts } from "@/lib/api/catalog";
import { ProductGrid } from "@/features/catalog/components/product-grid";

export default async function HomePage() {
  const { items: products } = await getProducts({ pageSize: 8 });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <section className="mb-10 rounded-2xl bg-zinc-100 px-6 py-12 text-center sm:py-16 dark:bg-zinc-900">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
          Tudo o que você precisa, num só lugar
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-zinc-600 dark:text-zinc-400">
          Eletrônicos, casa e decoração, moda e esporte — com entrega rápida e preço justo.
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Produtos em destaque
        </h2>
        <ProductGrid products={products} />
      </section>
    </div>
  );
}
