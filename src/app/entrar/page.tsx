import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { UserIcon } from "@/components/icons";
import { Card } from "@/components/ui/card";
import { FormularioEntrar } from "@/features/conta/components/formulario-entrar";
import { obterSessao } from "@/lib/auth/sessao";
import { destinoSeguro } from "@/lib/auth/tokens";

export const metadata: Metadata = {
  title: "Entrar",
  robots: { index: false },
};

export default async function EntrarPage(props: PageProps<"/entrar">) {
  const { redirecionar } = await props.searchParams;
  const destino = typeof redirecionar === "string" ? destinoSeguro(redirecionar) : undefined;

  if (await obterSessao()) redirect(destino ?? "/conta");

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12 sm:py-16">
      <Card className="w-full max-w-sm p-8">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <UserIcon className="h-5 w-5" />
        </span>
        <h1 className="mt-5 text-xl font-semibold tracking-tight">Entrar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Acompanhe seus pedidos e compre mais rápido.
        </p>

        <div className="mt-6">
          <FormularioEntrar redirecionar={destino} />
        </div>
      </Card>
    </div>
  );
}
