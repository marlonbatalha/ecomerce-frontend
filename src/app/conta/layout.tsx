import type { Metadata } from "next";
import { LogOutIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { NavDaConta } from "@/features/conta/components/nav-da-conta";
import { sair } from "@/lib/api/conta-acoes";
import { obterSessao } from "@/lib/auth/sessao";

export const metadata: Metadata = {
  title: { template: "%s · Minha conta", default: "Minha conta" },
  robots: { index: false },
};

/**
 * Moldura da área do cliente. Quem barra o acesso é cada página (`exigirSessao` com o próprio
 * caminho, pra voltar pra ela depois do login) e cada Server Action — o layout não sabe qual
 * página filha foi pedida e nem re-renderiza a cada navegação entre elas.
 */
export default async function ContaLayout({ children }: LayoutProps<"/conta">) {
  const sessao = await obterSessao();
  if (!sessao) return children;
  const { usuario } = sessao;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="grid gap-8 md:grid-cols-[13rem_1fr] md:gap-10">
        <aside className="md:sticky md:top-32 md:self-start">
          <p className="mb-1 truncate px-3 text-sm font-semibold">{usuario.nome}</p>
          <p className="mb-4 truncate px-3 text-xs text-muted-foreground">{usuario.email}</p>
          <NavDaConta />
          <form action={sair} className="mt-2 hidden md:block">
            <Button
              type="submit"
              variante="ghost"
              tamanho="sm"
              className="w-full justify-start gap-2.5 px-3"
            >
              <LogOutIcon className="h-4 w-4" />
              Sair
            </Button>
          </form>
        </aside>

        <div className="min-w-0">
          {children}
          <form action={sair} className="mt-10 md:hidden">
            <Button type="submit" variante="outline" className="w-full gap-2">
              <LogOutIcon className="h-4 w-4" />
              Sair da conta
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
