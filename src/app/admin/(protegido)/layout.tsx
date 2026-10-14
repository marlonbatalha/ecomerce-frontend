import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LogOutIcon } from "@/components/icons";
import { logoutAdmin } from "@/lib/api/admin-auth";
import { AdminNav } from "./admin-nav";

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
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-2 shadow-card">
        <AdminNav />
        <form action={logoutAdmin}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger"
          >
            <LogOutIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </form>
      </div>

      {children}
    </div>
  );
}
