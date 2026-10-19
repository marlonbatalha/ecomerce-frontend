import Link from "next/link";
import { ChevronRightIcon } from "@/components/icons";
import { formatCurrency } from "@/lib/format";
import type { PedidoResumo } from "@/types/conta";
import { formatarData, numeroDoPedido, StatusDoPedido } from "./status-do-pedido";

export function ListaDePedidos({ pedidos }: { pedidos: PedidoResumo[] }) {
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
      {pedidos.map((pedido) => (
        <li key={pedido.id}>
          <Link
            href={`/conta/pedidos/${pedido.id}`}
            className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-surface-muted sm:px-5"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-medium tabular-nums">{numeroDoPedido(pedido.id)}</span>
                <StatusDoPedido status={pedido.status} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatarData(pedido.criadoEm)} · {pedido.quantidadeDeItens}{" "}
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
  );
}
