import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { UserIcon } from "@/components/icons";
import { Card } from "@/components/ui/card";
import { ResumoDoPedido } from "@/features/conta/components/resumo-do-pedido";
import {
  formatarDataHora,
  numeroDoPedido,
  StatusDoPedido,
} from "@/features/conta/components/status-do-pedido";
import { obterPedidoAdmin } from "@/lib/api/admin-vendas";
import { AcoesDoPedido } from "./acoes-do-pedido";

/** O que o admin precisa saber em cada status — e por que, às vezes, não há nada a fazer. */
const ORIENTACAO: Partial<Record<string, string>> = {
  Pendente: "Aguardando o pagamento do cliente. Nada a fazer até o Mercado Pago confirmar.",
  PagamentoRecusado: "O pagamento foi recusado e os itens voltaram ao estoque.",
  Cancelado: "Pedido cancelado — os itens voltaram ao estoque.",
  Entregue: "Pedido concluído.",
  Reembolsado: "Pagamento estornado.",
};

export default async function AdminPedidoPage(props: PageProps<"/admin/pedidos/[id]">) {
  const { id } = await props.params;
  const resultado = await obterPedidoAdmin(id);
  if (!resultado) notFound();
  const { pedido, cliente } = resultado;

  const temAcao = pedido.status === "PagamentoConfirmado" || pedido.status === "Enviado";

  return (
    <div>
      <Breadcrumbs
        items={[{ label: "Pedidos", href: "/admin/pedidos" }, { label: numeroDoPedido(pedido.id) }]}
      />

      <header className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight tabular-nums">
          Pedido {numeroDoPedido(pedido.id)}
        </h1>
        <StatusDoPedido status={pedido.status} />
        <span className="text-sm text-muted-foreground">{formatarDataHora(pedido.criadoEm)}</span>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
        <ResumoDoPedido pedido={pedido} />

        <div className="space-y-6 lg:sticky lg:top-32">
          <Card className="p-5">
            <h2 className="mb-3 font-semibold">Cliente</h2>
            {cliente ? (
              <div className="flex items-start gap-3 text-sm">
                <UserIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="font-medium">{cliente.nome}</p>
                  <a
                    href={`mailto:${cliente.email}`}
                    className="break-all text-accent hover:text-accent-hover"
                  >
                    {cliente.email}
                  </a>
                  <Link
                    href={`/admin/clientes?termo=${encodeURIComponent(cliente.email)}`}
                    className="mt-2 block text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Ver na lista de clientes
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Cliente não encontrado (conta removida?).
              </p>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 font-semibold">{temAcao ? "Próximo passo" : "Situação"}</h2>
            {pedido.codigoRastreio && (
              <p className="mb-3 text-sm">
                <span className="text-muted-foreground">Rastreio: </span>
                <span className="font-mono font-medium">{pedido.codigoRastreio}</span>
              </p>
            )}
            {temAcao ? (
              <AcoesDoPedido pedidoId={pedido.id} status={pedido.status} />
            ) : (
              <p className="text-sm text-muted-foreground">{ORIENTACAO[pedido.status]}</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
