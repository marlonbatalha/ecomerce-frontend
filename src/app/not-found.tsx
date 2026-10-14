import Link from "next/link";
import { SearchIcon } from "@/components/icons";
import { buttonClasses } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-sm font-semibold tracking-widest text-accent">ERRO 404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        Página não encontrada
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        O que você procurava não existe ou foi removido.
      </p>

      <form action="/produtos" role="search" className="relative mt-8 w-full max-w-sm">
        <label htmlFor="busca-404" className="sr-only">
          Buscar na loja
        </label>
        <SearchIcon className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          id="busca-404"
          name="q"
          type="search"
          placeholder="Tente buscar um produto"
          className="h-11 w-full rounded-full border border-border-strong bg-surface pr-4 pl-11 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/15"
        />
      </form>

      <Link href="/" className={buttonClasses({ variante: "outline", className: "mt-4" })}>
        Voltar para a home
      </Link>
    </div>
  );
}
