import type {
  EnderecoDeEntrega,
  Paginado,
  Pedido,
  PedidoResumo,
  StatusPedido,
} from "@/types/conta";

/**
 * Tradução dos pedidos da API (enum numérico, preço decimal, data UTC sem fuso) pro formato do
 * frontend. Compartilhado entre a área do cliente (`conta.ts`) e o admin (`admin-vendas.ts`).
 */

/** Ordem do enum `StatusPedido` no backend — a API serializa o enum como número. */
export const STATUS_PEDIDO: StatusPedido[] = [
  "Pendente",
  "PagamentoConfirmado",
  "Enviado",
  "Entregue",
  "Cancelado",
  "PagamentoRecusado",
  "Reembolsado",
];

export type PedidoResumoApi = {
  id: string;
  usuarioId: string;
  status: number | StatusPedido;
  criadoEmUtc: string;
  total: number;
  quantidadeDeItens: number;
};

export type PedidoApi = {
  id: string;
  usuarioId: string;
  status: number | StatusPedido;
  criadoEmUtc: string;
  codigoRastreio: string | null;
  subtotal: number;
  desconto: number;
  codigoCupom: string | null;
  total: number;
  urlPagamento: string | null;
  entrega: (Omit<EnderecoDeEntrega, "complemento"> & { complemento: string | null }) | null;
  metodoDeEnvio: string | null;
  valorFrete: number;
  prazoEntregaDias: number | null;
  itens: {
    varianteDeProdutoId: string;
    nomeProduto: string;
    precoUnitario: number;
    quantidade: number;
    subtotal: number;
  }[];
};

export type ResultadoPaginadoApi<T> = {
  itens: T[];
  pagina: number;
  tamanhoPagina: number;
  totalItens: number;
};

export function centavos(valor: number): number {
  return Math.round(valor * 100);
}

function status(valor: number | StatusPedido): StatusPedido {
  return typeof valor === "number" ? (STATUS_PEDIDO[valor] ?? "Pendente") : valor;
}

/** DateTime UTC do .NET às vezes vem sem fuso ("2026-10-19T03:00:00") — é UTC, não hora local. */
export function dataUtc(valor: string): Date {
  return new Date(/[zZ]|[+-]\d\d:\d\d$/.test(valor) ? valor : `${valor}Z`);
}

export function paginado<TApi, T>(
  resultado: ResultadoPaginadoApi<TApi>,
  mapear: (item: TApi) => T,
): Paginado<T> {
  return {
    itens: resultado.itens.map(mapear),
    pagina: resultado.pagina,
    total: resultado.totalItens,
    totalPaginas:
      resultado.tamanhoPagina > 0 ? Math.ceil(resultado.totalItens / resultado.tamanhoPagina) : 0,
  };
}

export function mapearResumo(p: PedidoResumoApi): PedidoResumo {
  return {
    id: p.id,
    usuarioId: p.usuarioId,
    status: status(p.status),
    criadoEm: dataUtc(p.criadoEmUtc),
    totalInCents: centavos(p.total),
    quantidadeDeItens: p.quantidadeDeItens,
  };
}

export function mapearPedido(p: PedidoApi): Pedido {
  return {
    id: p.id,
    usuarioId: p.usuarioId,
    status: status(p.status),
    criadoEm: dataUtc(p.criadoEmUtc),
    codigoRastreio: p.codigoRastreio ?? undefined,
    subtotalInCents: centavos(p.subtotal),
    descontoInCents: centavos(p.desconto),
    codigoCupom: p.codigoCupom ?? undefined,
    totalInCents: centavos(p.total),
    urlPagamento: p.urlPagamento ?? undefined,
    entrega: p.entrega
      ? { ...p.entrega, complemento: p.entrega.complemento ?? undefined }
      : undefined,
    metodoDeEnvio: p.metodoDeEnvio ?? undefined,
    freteInCents: centavos(p.valorFrete),
    prazoEntregaDias: p.prazoEntregaDias ?? undefined,
    itens: p.itens.map((i) => ({
      varianteId: i.varianteDeProdutoId,
      nomeProduto: i.nomeProduto,
      precoUnitarioInCents: centavos(i.precoUnitario),
      quantidade: i.quantidade,
      subtotalInCents: centavos(i.subtotal),
    })),
  };
}
