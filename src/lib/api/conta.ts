import { redirect } from "next/navigation";
import { chamarApi } from "@/lib/api/resposta";
import type { SessaoDoCliente } from "@/lib/auth/sessao";
import type {
  Endereco,
  EnderecoDeEntrega,
  Paginado,
  Pedido,
  PedidoResumo,
  Perfil,
  StatusPedido,
} from "@/types/conta";

/**
 * Leituras da área do cliente (Server Components). Sempre sem cache: são dados de uma pessoa,
 * nunca podem ir pro cache compartilhado do Next. Mutações ficam em `conta-acoes.ts`.
 */

/** Ordem do enum `StatusPedido` no backend — a API serializa o enum como número. */
const STATUS_POR_INDICE: StatusPedido[] = [
  "Pendente",
  "PagamentoConfirmado",
  "Enviado",
  "Entregue",
  "Cancelado",
  "PagamentoRecusado",
  "Reembolsado",
];

type PerfilApi = { id: string; nome: string; email: string };

type EnderecoApi = Omit<Endereco, "complemento"> & { complemento: string | null };

type PedidoResumoApi = {
  id: string;
  status: number | StatusPedido;
  criadoEmUtc: string;
  total: number;
  quantidadeDeItens: number;
};

type PedidoApi = {
  id: string;
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

type ResultadoPaginadoApi<T> = {
  itens: T[];
  pagina: number;
  tamanhoPagina: number;
  totalItens: number;
};

function centavos(valor: number): number {
  return Math.round(valor * 100);
}

function status(valor: number | StatusPedido): StatusPedido {
  return typeof valor === "number" ? (STATUS_POR_INDICE[valor] ?? "Pendente") : valor;
}

/** DateTime UTC do .NET às vezes vem sem fuso ("2026-10-19T03:00:00") — é UTC, não hora local. */
function dataUtc(valor: string): Date {
  return new Date(/[zZ]|[+-]\d\d:\d\d$/.test(valor) ? valor : `${valor}Z`);
}

/** Token aceito pelo proxy mas recusado pela API (revogado em outro dispositivo, p.ex.) → login de novo. */
async function lerDaApi<T>(caminho: string, sessao: SessaoDoCliente, destino: string): Promise<T> {
  const resposta = await chamarApi<T>(caminho, { token: sessao.accessToken });
  if (resposta.ok) return resposta.dados;
  if (resposta.status === 401) redirect(`/entrar?redirecionar=${encodeURIComponent(destino)}`);
  throw new Error(`Falha ao buscar ${caminho}: ${resposta.status} ${resposta.erro}`);
}

export async function obterPerfil(sessao: SessaoDoCliente): Promise<Perfil> {
  const perfil = await lerDaApi<PerfilApi>("/conta/perfil", sessao, "/conta/dados");
  return { id: perfil.id, nome: perfil.nome, email: perfil.email };
}

export async function listarEnderecos(sessao: SessaoDoCliente): Promise<Endereco[]> {
  const enderecos = await lerDaApi<EnderecoApi[]>("/conta/enderecos", sessao, "/conta/enderecos");
  return enderecos.map((e) => ({ ...e, complemento: e.complemento ?? undefined }));
}

export async function listarPedidos(
  sessao: SessaoDoCliente,
  pagina = 1,
  tamanhoPagina = 10,
): Promise<Paginado<PedidoResumo>> {
  const resultado = await lerDaApi<ResultadoPaginadoApi<PedidoResumoApi>>(
    `/pedidos?pagina=${pagina}&tamanhoPagina=${tamanhoPagina}`,
    sessao,
    "/conta/pedidos",
  );

  return {
    itens: resultado.itens.map((p) => ({
      id: p.id,
      status: status(p.status),
      criadoEm: dataUtc(p.criadoEmUtc),
      totalInCents: centavos(p.total),
      quantidadeDeItens: p.quantidadeDeItens,
    })),
    pagina: resultado.pagina,
    total: resultado.totalItens,
    totalPaginas:
      resultado.tamanhoPagina > 0 ? Math.ceil(resultado.totalItens / resultado.tamanhoPagina) : 0,
  };
}

/** `null` quando o pedido não existe ou é de outra pessoa (a API responde 404 nos dois casos). */
export async function obterPedido(sessao: SessaoDoCliente, id: string): Promise<Pedido | null> {
  const destino = `/conta/pedidos/${id}`;
  const resposta = await chamarApi<PedidoApi>(`/pedidos/${encodeURIComponent(id)}`, {
    token: sessao.accessToken,
  });

  if (resposta.status === 404 || resposta.status === 400) return null;
  if (resposta.status === 401) redirect(`/entrar?redirecionar=${encodeURIComponent(destino)}`);
  if (!resposta.ok) throw new Error(`Falha ao buscar o pedido: ${resposta.status}`);

  return mapearPedido(resposta.dados);
}

function mapearPedido(p: PedidoApi): Pedido {
  return {
    id: p.id,
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
