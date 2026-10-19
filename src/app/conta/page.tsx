import Link from "next/link";
import { MapPinIcon, PackageIcon } from "@/components/icons";
import { buttonClasses } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/card";
import { ListaDePedidos } from "@/features/conta/components/lista-de-pedidos";
import { listarEnderecos, listarPedidos } from "@/lib/api/conta";
import { exigirSessao } from "@/lib/auth/sessao";

export default async function ContaPage() {
  const sessao = await exigirSessao("/conta");
  const [pedidos, enderecos] = await Promise.all([
    listarPedidos(sessao, 1, 3),
    listarEnderecos(sessao),
  ]);
  const padrao = enderecos.find((e) => e.padrao);

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Olá, {sessao.usuario.nome.split(" ")[0]}
        </h1>
        <p className="mt-1.5 text-muted-foreground">Seus pedidos e dados num lugar só.</p>
      </header>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight">Pedidos recentes</h2>
          {pedidos.total > 0 && (
            <Link
              href="/conta/pedidos"
              className="text-sm font-medium text-accent hover:text-accent-hover"
            >
              Ver todos ({pedidos.total})
            </Link>
          )}
        </div>
        {pedidos.itens.length > 0 ? (
          <ListaDePedidos pedidos={pedidos.itens} />
        ) : (
          <EmptyState
            icon={<PackageIcon className="h-7 w-7" />}
            title="Nenhum pedido ainda"
            description="Quando você comprar, seus pedidos aparecem aqui."
            action={
              <Link href="/produtos" className={buttonClasses()}>
                Ver produtos
              </Link>
            }
          />
        )}
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight">Endereço de entrega</h2>
          <Link
            href="/conta/enderecos"
            className="text-sm font-medium text-accent hover:text-accent-hover"
          >
            {enderecos.length > 0 ? "Gerenciar" : "Cadastrar"}
          </Link>
        </div>
        <Card className="flex items-start gap-3 p-5">
          <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
          {padrao ? (
            <div className="text-sm">
              <p className="font-medium">{padrao.rotulo}</p>
              <p className="mt-1 text-muted-foreground">
                {padrao.logradouro}, {padrao.numero}
                {padrao.complemento && ` — ${padrao.complemento}`}
                <br />
                {padrao.bairro}, {padrao.cidade}/{padrao.estado} · CEP {padrao.cep}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhum endereço cadastrado. Cadastre um pra agilizar o checkout.
            </p>
          )}
        </Card>
      </section>
    </div>
  );
}
