import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeftIcon } from "@/components/icons";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BotaoCancelarPedido } from "@/features/conta/components/botao-cancelar-pedido";
import { ResumoDoPedido } from "@/features/conta/components/resumo-do-pedido";
import {
  formatarDataHora,
  numeroDoPedido,
  StatusDoPedido,
} from "@/features/conta/components/status-do-pedido";
import { obterPedido } from "@/lib/api/conta";
import { exigirSessao } from "@/lib/auth/sessao";

export async function generateMetadata(props: PageProps<"/conta/pedidos/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  return { title: `Pedido ${numeroDoPedido(id)}` };
}

export default async function PedidoPage(props: PageProps<"/conta/pedidos/[id]">) {
  const { id } = await props.params;
  const sessao = await exigirSessao(`/conta/pedidos/${id}`);

  const pedido = await obterPedido(sessao, id);
  if (!pedido) notFound();

  const pendente = pedido.status === "Pendente";

  return (
    <>
      <Link
        href="/conta/pedidos"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        Meus pedidos
      </Link>

      <header className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight tabular-nums">
          Pedido {numeroDoPedido(pedido.id)}
        </h1>
        <StatusDoPedido status={pedido.status} />
      </header>
      <p className="-mt-4 mb-6 text-sm text-muted-foreground">
        Feito em {formatarDataHora(pedido.criadoEm)}
      </p>

      {pendente && pedido.urlPagamento && (
        <Card className="mb-6 flex flex-wrap items-center justify-between gap-4 border-warning/40 bg-warning-soft p-5">
          <p className="text-sm">
            <span className="font-medium">Pagamento pendente.</span> Conclua pelo Mercado Pago pra
            liberarmos o envio.
          </p>
          <a href={pedido.urlPagamento} className={buttonClasses({ variante: "primary" })}>
            Pagar agora
          </a>
        </Card>
      )}

      {pedido.codigoRastreio && (
        <Card className="mb-6 p-5 text-sm">
          <span className="text-muted-foreground">Código de rastreio: </span>
          <span className="font-medium tabular-nums">{pedido.codigoRastreio}</span>
        </Card>
      )}

      <ResumoDoPedido pedido={pedido} />

      {pendente && (
        <div className="mt-6">
          <BotaoCancelarPedido pedidoId={pedido.id} />
        </div>
      )}
    </>
  );
}
