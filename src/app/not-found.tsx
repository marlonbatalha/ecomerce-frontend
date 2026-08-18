import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Página não encontrada
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        O que você procurava não existe ou foi removido.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-300"
      >
        Voltar para a home
      </Link>
    </div>
  );
}
