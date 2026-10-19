import { Badge } from "@/components/ui/badge";
import type { StatusPedido } from "@/types/conta";

const STATUS: Record<
  StatusPedido,
  { rotulo: string; tom: "neutral" | "accent" | "success" | "warning" | "danger" }
> = {
  Pendente: { rotulo: "Aguardando pagamento", tom: "warning" },
  PagamentoConfirmado: { rotulo: "Pagamento confirmado", tom: "accent" },
  Enviado: { rotulo: "Enviado", tom: "accent" },
  Entregue: { rotulo: "Entregue", tom: "success" },
  Cancelado: { rotulo: "Cancelado", tom: "neutral" },
  PagamentoRecusado: { rotulo: "Pagamento recusado", tom: "danger" },
  Reembolsado: { rotulo: "Reembolsado", tom: "neutral" },
};

export function StatusDoPedido({ status }: { status: StatusPedido }) {
  const { rotulo, tom } = STATUS[status];
  return <Badge tom={tom}>{rotulo}</Badge>;
}

/** "19/10/2026" — data do pedido no fuso do Brasil, não no do servidor. */
export function formatarData(data: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(data);
}

/** "19/10/2026, 14:32". */
export function formatarDataHora(data: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(data);
}

/** Número curto e legível pro cliente (os 8 primeiros caracteres do id). */
export function numeroDoPedido(id: string): string {
  return `#${id.slice(0, 8).toUpperCase()}`;
}
