import Link from "next/link";
import { ChevronRightIcon, PackageIcon } from "@/components/icons";
import { Pagination } from "@/components/pagination";
import { EmptyState, PageHeader } from "@/components/ui/card";
import {
  formatarDataHora,
  numeroDoPedido,
  StatusDoPedido,
} from "@/features/conta/components/status-do-pedido";
import { listarPedidosAdmin } from "@/lib/api/admin-vendas";
import { STATUS_PEDIDO } from "@/lib/api/pedidos";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";
import type { StatusPedido } from "@/types/conta";

/** Filtros na ordem de trabalho: o que precisa de ação primeiro. */
const FILTROS: { status?: StatusPedido; rotulo: string }[] = [
  { rotulo: "Todos" },
  { status: "PagamentoConfirmado", rotulo: "A enviar" },
  { status: "Pendente", rotulo: "Aguardando pagamento" },
  { status: "Enviado", rotulo: "Enviados" },
  { status: "Entregue", rotulo: "Entregues" },
  { status: "Cancelado", rotulo: "Cancelados" },
  { status: "PagamentoRecusado", rotulo: "Pagamento recusado" },
];

function link(status: StatusPedido | undefined, pagina = 1): string {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (pagina > 1) params.set("pagina", String(pagina));
  const qs = params.toString();
  return qs ? `/admin/pedidos?${qs}` : "/admin/pedidos";
}

export default async function AdminPedidosPage(props: PageProps<"/admin/pedidos">) {
  const { status: statusBruto, pagina: paginaBruta } = await props.searchParams;
  const status = STATUS_PEDIDO.find((s) => s === statusBruto);
  const numero = Number(paginaBruta);
  const pagina = Number.isInteger(numero) && numero > 0 ? numero : 1;

  const pedidos = await listarPedidosAdmin(status, pagina);

  return (
    <div>
      <PageHeader
        title="Pedidos"
        description={`${pedidos.total} ${pedidos.total === 1 ? "pedido" : "pedidos"}`}
      />

      <div
        role="group"
        aria-label="Filtrar por status"
        className="-mx-4 mb-6 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
      >
        {FILTROS.map((filtro) => {
          const ativo = filtro.status === status;
          return (
            <Link
              key={filtro.rotulo}
              href={link(filtro.status)}
              aria-current={ativo ? "true" : undefined}
              className={cn(
                "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                ativo
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground",
              )}
            >
              {filtro.rotulo}
            </Link>
          );
        })}
      </div>

      {pedidos.itens.length === 0 ? (
        <EmptyState icon={<PackageIcon className="h-7 w-7" />} title="Nenhum pedido aqui" />
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
          {pedidos.itens.map((pedido) => (
            <li key={pedido.id}>
              <Link
                href={`/admin/pedidos/${pedido.id}`}
                className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-surface-muted sm:px-5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-medium tabular-nums">{numeroDoPedido(pedido.id)}</span>
                    <StatusDoPedido status={pedido.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatarDataHora(pedido.criadoEm)} · {pedido.quantidadeDeItens}{" "}
                    {pedido.quantidadeDeItens === 1 ? "item" : "itens"}
                  </p>
                </div>
                <span className="font-semibold tabular-nums">
                  {formatCurrency(pedido.totalInCents)}
                </span>
                <ChevronRightIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Pagination
        page={pagina}
        totalPages={pedidos.totalPaginas}
        hrefForPage={(p) => link(status, p)}
      />
    </div>
  );
}
