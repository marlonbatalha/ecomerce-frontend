import Link from "next/link";

export default function AdminPainelPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Painel admin
      </h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/categorias"
          className="rounded-lg border border-zinc-200 p-6 hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
        >
          <h2 className="font-medium text-zinc-900 dark:text-zinc-50">Categorias</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Criar e ver categorias do catálogo.
          </p>
        </Link>
        <Link
          href="/admin/produtos"
          className="rounded-lg border border-zinc-200 p-6 hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
        >
          <h2 className="font-medium text-zinc-900 dark:text-zinc-50">Produtos</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Cadastrar produto e adicionar variante/estoque.
          </p>
        </Link>
      </div>
    </div>
  );
}
