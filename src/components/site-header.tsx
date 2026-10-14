import Link from "next/link";
import { BagIcon, SearchIcon } from "@/components/icons";
import { CartBadge } from "@/features/cart/components/cart-badge";
import { ThemeToggle } from "@/features/theme/theme-toggle";
import type { Category } from "@/types/catalog";

export function SiteHeader({ categories }: { categories: Category[] }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:gap-6 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BagIcon className="h-[18px] w-[18px]" />
          </span>
          <span className="hidden text-lg sm:inline">Loja</span>
        </Link>

        <form action="/produtos" role="search" className="relative min-w-0 flex-1 sm:max-w-md">
          <label htmlFor="search" className="sr-only">
            Buscar produtos
          </label>
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="search"
            name="q"
            type="search"
            placeholder="Buscar produtos..."
            className="h-10 w-full rounded-full border border-border bg-surface-muted pr-4 pl-10 text-sm transition-[border-color,background-color,box-shadow] outline-none placeholder:text-muted-foreground focus:border-accent focus:bg-surface focus:ring-4 focus:ring-accent/15"
          />
        </form>

        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <CartBadge />
        </div>
      </div>

      {categories.length > 0 && (
        <nav aria-label="Categorias" className="border-t border-border/60">
          {/* Uma linha só, rolando na horizontal no celular — sem menu duplicado. */}
          <div className="mx-auto flex h-11 max-w-6xl [scrollbar-width:none] items-center gap-1 overflow-x-auto px-4 text-sm sm:px-6">
            <Link
              href="/produtos"
              className="shrink-0 rounded-full px-3 py-1.5 font-medium text-foreground transition-colors hover:bg-surface-muted"
            >
              Todos os produtos
            </Link>
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/categorias/${category.slug}`}
                className="shrink-0 rounded-full px-3 py-1.5 text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
