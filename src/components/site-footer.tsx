import Link from "next/link";
import { BagIcon } from "@/components/icons";
import type { Category } from "@/types/catalog";

export function SiteFooter({ categories }: { categories: Category[] }) {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BagIcon className="h-[18px] w-[18px]" />
            </span>
            Loja
          </Link>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Eletrônicos, casa, moda e esporte com entrega rastreada e pagamento seguro.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold">Categorias</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {categories.slice(0, 6).map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/categorias/${category.slug}`}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold">Sua compra</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link
                href="/produtos"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Todos os produtos
              </Link>
            </li>
            <li>
              <Link
                href="/carrinho"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Meu carrinho
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} Loja. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
