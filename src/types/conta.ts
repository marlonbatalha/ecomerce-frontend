/**
 * Contratos da área do cliente (`/conta`), já traduzidos do formato da API (preço em centavos,
 * datas como `Date`) por `src/lib/api/conta.ts`.
 */

export type Perfil = {
  id: string;
  nome: string;
  email: string;
};

export type Endereco = {
  id: string;
  rotulo: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  padrao: boolean;
};

/** Mesmos nomes do enum `StatusPedido` do backend. */
export type StatusPedido =
  | "Pendente"
  | "PagamentoConfirmado"
  | "Enviado"
  | "Entregue"
  | "Cancelado"
  | "PagamentoRecusado"
  | "Reembolsado";

export type PedidoResumo = {
  id: string;
  status: StatusPedido;
  criadoEm: Date;
  totalInCents: number;
  quantidadeDeItens: number;
};

export type ItemDoPedido = {
  varianteId: string;
  nomeProduto: string;
  precoUnitarioInCents: number;
  quantidade: number;
  subtotalInCents: number;
};

export type Pedido = {
  id: string;
  status: StatusPedido;
  criadoEm: Date;
  codigoRastreio?: string;
  subtotalInCents: number;
  descontoInCents: number;
  codigoCupom?: string;
  totalInCents: number;
  itens: ItemDoPedido[];
  /** Ausente só em pedidos de antes da entrega existir no checkout. */
  entrega?: EnderecoDeEntrega;
  metodoDeEnvio?: string;
  freteInCents: number;
  prazoEntregaDias?: number;
  /** Link pra retomar o pagamento (Mercado Pago) de um pedido ainda pendente. */
  urlPagamento?: string;
};

/** Cópia do endereço feita na compra — não muda se o cliente editar o endereço depois. */
export type EnderecoDeEntrega = {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
};

export type Paginado<T> = {
  itens: T[];
  pagina: number;
  totalPaginas: number;
  total: number;
};
