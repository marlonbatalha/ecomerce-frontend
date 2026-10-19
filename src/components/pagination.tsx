import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

type PaginationProps = {
  page: number;
  totalPages: number;
  /** Link de cada página — quem chama mantém os filtros atuais. */
  hrefForPage: (page: number) => string;
};

/**
 * Páginas exibidas: primeira, última e as vizinhas da atual; buracos viram reticências.
 * Ex.: atual 6 de 12 → 1 … 5 6 7 … 12.
 */
function paginasVisiveis(page: number, totalPages: number): (number | "…")[] {
  const paginas = new Set([1, totalPages, page - 1, page, page + 1]);
  const ordenadas = [...paginas].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  return ordenadas.flatMap((p, i) => (i > 0 && p - ordenadas[i - 1] > 1 ? ["…" as const, p] : [p]));
}

const ITEM =
  "inline-flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-medium tabular-nums transition-colors";

/** Paginação por links (funciona sem JavaScript e cada página tem URL própria, boa pra SEO). */
export function Pagination({ page, totalPages, hrefForPage }: PaginationProps) {
  if (totalPages <= 1) return null;

  const anterior = page > 1 ? hrefForPage(page - 1) : undefined;
  const proxima = page < totalPages ? hrefForPage(page + 1) : undefined;

  return (
    <nav aria-label="Paginação" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      {anterior ? (
        <Link
          href={anterior}
          rel="prev"
          className={cn(ITEM, "border-border bg-surface hover:border-border-strong")}
        >
          <ChevronLeftIcon className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:ml-1">Anterior</span>
        </Link>
      ) : null}

      {paginasVisiveis(page, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`reticencias-${i}`} aria-hidden className="px-1 text-muted-foreground">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={hrefForPage(p)}
            aria-current={p === page ? "page" : undefined}
            aria-label={`Página ${p}`}
            className={cn(
              ITEM,
              p === page
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface hover:border-border-strong",
            )}
          >
            {p}
          </Link>
        ),
      )}

      {proxima ? (
        <Link
          href={proxima}
          rel="next"
          className={cn(ITEM, "border-border bg-surface hover:border-border-strong")}
        >
          <span className="sr-only sm:not-sr-only sm:mr-1">Próxima</span>
          <ChevronRightIcon className="h-4 w-4" />
        </Link>
      ) : null}
    </nav>
  );
}
