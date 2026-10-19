import { MapPinIcon } from "@/components/icons";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import type { Pedido } from "@/types/conta";

/** Itens, totais e entrega de um pedido — detalhe na conta e confirmação pós-checkout. */
export function ResumoDoPedido({ pedido }: { pedido: Pedido }) {
  return (
    <div className="space-y-6">
      {pedido.entrega && (
        <Card className="flex gap-3 p-5 text-sm">
          <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
          <div>
            <p className="font-medium">
              Entrega{pedido.metodoDeEnvio && ` via ${pedido.metodoDeEnvio}`}
              {pedido.prazoEntregaDias !== undefined &&
                ` · até ${pedido.prazoEntregaDias} ${pedido.prazoEntregaDias === 1 ? "dia útil" : "dias úteis"}`}
            </p>
            <p className="mt-1 text-muted-foreground">
              {pedido.entrega.logradouro}, {pedido.entrega.numero}
              {pedido.entrega.complemento && ` — ${pedido.entrega.complemento}`}
              <br />
              {pedido.entrega.bairro}, {pedido.entrega.cidade}/{pedido.entrega.estado} · CEP{" "}
              {pedido.entrega.cep}
            </p>
          </div>
        </Card>
      )}

      <Card className="p-5 sm:p-6">
        <h2 className="mb-4 font-semibold">Itens</h2>
        <ul className="divide-y divide-border">
          {pedido.itens.map((item) => (
            <li key={item.varianteId} className="flex justify-between gap-4 py-3 text-sm">
              <span>
                {item.quantidade}× {item.nomeProduto}
                <span className="block text-xs text-muted-foreground tabular-nums">
                  {formatCurrency(item.precoUnitarioInCents)} cada
                </span>
              </span>
              <span className="shrink-0 font-medium tabular-nums">
                {formatCurrency(item.subtotalInCents)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <dt>Subtotal</dt>
            <dd className="tabular-nums">{formatCurrency(pedido.subtotalInCents)}</dd>
          </div>
          {pedido.descontoInCents > 0 && (
            <div className="flex justify-between text-success">
              <dt>Desconto{pedido.codigoCupom && ` (${pedido.codigoCupom})`}</dt>
              <dd className="tabular-nums">−{formatCurrency(pedido.descontoInCents)}</dd>
            </div>
          )}
          {pedido.entrega && (
            <div className="flex justify-between text-muted-foreground">
              <dt>Frete{pedido.metodoDeEnvio && ` (${pedido.metodoDeEnvio})`}</dt>
              <dd className="tabular-nums">{formatCurrency(pedido.freteInCents)}</dd>
            </div>
          )}
          <div className="flex justify-between text-base font-semibold">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatCurrency(pedido.totalInCents)}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
