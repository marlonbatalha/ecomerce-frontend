import Link from "next/link";
import { CartBadge } from "@/features/cart/components/cart-badge";
import type { Category } from "@/types/catalog";

export function SiteHeader({ categories }: { categories: Category[] }) {
  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Loja
        </Link>

        <nav className="flex flex-wrap gap-4 text-sm text-zinc-600 dark:text-zinc-400">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/categorias/${category.slug}`}
              className="transition-colors hover:text-black dark:hover:text-white"
            >
              {category.name}
            </Link>
          ))}
        </nav>

        <form action="/produtos" className="ml-auto flex min-w-[12rem] flex-1 sm:flex-none">
          <label htmlFor="search" className="sr-only">
            Buscar produtos
          </label>
          <input
            id="search"
            name="q"
            type="search"
            placeholder="Buscar produtos..."
            className="w-full rounded-full border border-zinc-300 px-4 py-1.5 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-500"
          />
        </form>

        <CartBadge />
      </div>
    </header>
  );
}
