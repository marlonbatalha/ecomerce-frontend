import type { ReactNode } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logoutAdmin } from "@/lib/api/admin-auth";

/**
 * Guarda de rota do admin — group route `(protegido)` deixa `/admin/login` FORA deste layout de
 * propósito: se o login também passasse por aqui, o redirect abaixo criaria um loop infinito
 * (layout redireciona pro login -> login também é filho do layout -> redireciona nele mesmo).
 */
export default async function AdminProtegidoLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const logado = Boolean(cookieStore.get("admin_session")?.value);

  if (!logado) redirect("/admin/login");

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-8 flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <nav className="flex gap-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <Link href="/admin" className="hover:text-zinc-900 dark:hover:text-zinc-50">
            Painel
          </Link>
          <Link href="/admin/categorias" className="hover:text-zinc-900 dark:hover:text-zinc-50">
            Categorias
          </Link>
          <Link href="/admin/produtos" className="hover:text-zinc-900 dark:hover:text-zinc-50">
            Produtos
          </Link>
        </nav>
        <form action={logoutAdmin}>
          <button
            type="submit"
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Sair
          </button>
        </form>
      </header>

      {children}
    </div>
  );
}
