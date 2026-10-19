"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirTokenAdmin } from "@/lib/api/admin-auth";
import type { EstadoDoFormulario } from "@/lib/api/conta-acoes";
import {
  centavos,
  dataUtc,
  mapearPedido,
  mapearResumo,
  paginado,
  STATUS_PEDIDO,
  type PedidoApi,
  type PedidoResumoApi,
  type ResultadoPaginadoApi,
} from "@/lib/api/pedidos";
import { chamarApi, type OpcoesDaChamada, type RespostaDaApi } from "@/lib/api/resposta";
import type { Paginado, Pedido, PedidoResumo, StatusPedido } from "@/types/conta";

/**
 * Admin de vendas: pedidos (enviar/entregar), clientes e cupons. Tudo exige a sessão de admin
 * (`exigirTokenAdmin`); a API confere a role de novo em cada endpoint.
 */

export type ClienteAdmin = { id: string; nome: string; email: string; papeis: string[] };

export type CupomAdmin = {
  id: string;
  codigo: string;
  descricao: string;
  tipo: "Percentual" | "ValorFixo";
  /** Percentual (ex.: 10 = 10%) ou valor fixo em centavos, conforme `tipo`. */
  valor: number;
  valorMinimoInCents?: number;
  validoAte?: Date;
  limiteDeUsos?: number;
  quantidadeDeUsos: number;
  ativo: boolean;
};

type CupomApi = {
  id: string;
  codigo: string;
  descricao: string;
  tipo: number | "Percentual" | "ValorFixo";
  valor: number;
  valorMinimoDoPedido: number | null;
  validoAteUtc: string | null;
  limiteDeUsos: number | null;
  quantidadeDeUsos: number;
  ativo: boolean;
};

const TIPOS_DE_CUPOM = ["Percentual", "ValorFixo"] as const;

/** Token de admin expirado (sem renovação — ver plano, seção 2.10.1) → login do admin de novo. */
async function chamarComoAdmin<T>(
  caminho: string,
  opcoes: OpcoesDaChamada = {},
): Promise<RespostaDaApi<T>> {
  const token = await exigirTokenAdmin();
  const resposta = await chamarApi<T>(caminho, { ...opcoes, token });
  if (!resposta.ok && (resposta.status === 401 || resposta.status === 403))
    redirect("/admin/login");
  return resposta;
}

async function lerComoAdmin<T>(caminho: string): Promise<T> {
  const resposta = await chamarComoAdmin<T>(caminho);
  if (!resposta.ok)
    throw new Error(`Falha ao buscar ${caminho}: ${resposta.status} ${resposta.erro}`);
  return resposta.dados;
}

function texto(formData: FormData, campo: string): string {
  return String(formData.get(campo) ?? "").trim();
}

// --- Pedidos --------------------------------------------------------------------------------------

export async function listarPedidosAdmin(
  status: StatusPedido | undefined,
  pagina: number,
  tamanhoPagina = 20,
): Promise<Paginado<PedidoResumo>> {
  const filtro = status ? `&status=${STATUS_PEDIDO.indexOf(status)}` : "";
  const resultado = await lerComoAdmin<ResultadoPaginadoApi<PedidoResumoApi>>(
    `/pedidos/admin?pagina=${pagina}&tamanhoPagina=${tamanhoPagina}${filtro}`,
  );
  return paginado(resultado, mapearResumo);
}

/** Só o total (pra contadores do painel) — pede uma página de 1 item. */
export async function contarPedidosAdmin(status: StatusPedido): Promise<number> {
  return (await listarPedidosAdmin(status, 1, 1)).total;
}

export async function obterPedidoAdmin(
  id: string,
): Promise<{ pedido: Pedido; cliente: ClienteAdmin | null } | null> {
  const resposta = await chamarComoAdmin<PedidoApi>(`/pedidos/admin/${encodeURIComponent(id)}`);
  if (resposta.status === 404 || resposta.status === 400) return null;
  if (!resposta.ok) throw new Error(`Falha ao buscar o pedido: ${resposta.status}`);

  const pedido = mapearPedido(resposta.dados);
  return { pedido, cliente: await obterClienteAdmin(pedido.usuarioId) };
}

export async function enviarPedidoAdmin(
  _anterior: EstadoDoFormulario,
  formData: FormData,
): Promise<EstadoDoFormulario> {
  const id = texto(formData, "id");
  const codigoRastreio = texto(formData, "codigoRastreio");
  if (!codigoRastreio) {
    return { erro: "Informe o código de rastreio.", campos: { codigoRastreio: "Obrigatório." } };
  }

  const resposta = await chamarComoAdmin(`/pedidos/${encodeURIComponent(id)}/enviar`, {
    metodo: "POST",
    json: { codigoRastreio },
  });
  if (!resposta.ok) return { erro: resposta.erro, valores: { codigoRastreio } };

  revalidatePath(`/admin/pedidos/${id}`);
  revalidatePath("/admin/pedidos");
  return { sucesso: "Pedido marcado como enviado. O cliente recebe o rastreio por e-mail." };
}

export async function entregarPedidoAdmin(
  _anterior: EstadoDoFormulario,
  formData: FormData,
): Promise<EstadoDoFormulario> {
  const id = texto(formData, "id");
  const resposta = await chamarComoAdmin(`/pedidos/${encodeURIComponent(id)}/entregar`, {
    metodo: "POST",
  });
  if (!resposta.ok) return { erro: resposta.erro };

  revalidatePath(`/admin/pedidos/${id}`);
  revalidatePath("/admin/pedidos");
  return { sucesso: "Pedido marcado como entregue." };
}

// --- Clientes -------------------------------------------------------------------------------------

export async function buscarClientesAdmin(
  termo: string | undefined,
  pagina: number,
): Promise<Paginado<ClienteAdmin>> {
  const busca = termo ? `&termo=${encodeURIComponent(termo)}` : "";
  const resultado = await lerComoAdmin<ResultadoPaginadoApi<ClienteAdmin>>(
    `/clientes?pagina=${pagina}&tamanhoPagina=20${busca}`,
  );
  return paginado(resultado, (c) => c);
}

export async function obterClienteAdmin(id: string): Promise<ClienteAdmin | null> {
  const resposta = await chamarComoAdmin<ClienteAdmin>(`/clientes/${encodeURIComponent(id)}`);
  return resposta.ok ? resposta.dados : null;
}

// --- Cupons ---------------------------------------------------------------------------------------

export async function listarCuponsAdmin(): Promise<CupomAdmin[]> {
  const cupons = await lerComoAdmin<CupomApi[]>("/cupons");
  return cupons.map((c) => {
    const tipo = typeof c.tipo === "number" ? TIPOS_DE_CUPOM[c.tipo] : c.tipo;
    return {
      id: c.id,
      codigo: c.codigo,
      descricao: c.descricao,
      tipo,
      valor: tipo === "ValorFixo" ? centavos(c.valor) : c.valor,
      valorMinimoInCents:
        c.valorMinimoDoPedido != null ? centavos(c.valorMinimoDoPedido) : undefined,
      validoAte: c.validoAteUtc ? dataUtc(c.validoAteUtc) : undefined,
      limiteDeUsos: c.limiteDeUsos ?? undefined,
      quantidadeDeUsos: c.quantidadeDeUsos,
      ativo: c.ativo,
    };
  });
}

/** "49,90" → 49.9 · vazio → null. */
function decimal(valor: string): number | null {
  if (!valor) return null;
  const numero = Number(valor.replace(",", "."));
  return Number.isFinite(numero) ? numero : NaN;
}

export async function criarCupomAdmin(
  _anterior: EstadoDoFormulario,
  formData: FormData,
): Promise<EstadoDoFormulario> {
  const campos = [
    "codigo",
    "descricao",
    "tipo",
    "valor",
    "valorMinimo",
    "validoAte",
    "limiteDeUsos",
  ];
  const valores = Object.fromEntries(campos.map((c) => [c, texto(formData, c)]));

  const valor = decimal(valores.valor);
  const valorMinimo = decimal(valores.valorMinimo);
  const limite = valores.limiteDeUsos ? Number(valores.limiteDeUsos) : null;
  if (
    valor === null ||
    Number.isNaN(valor) ||
    Number.isNaN(valorMinimo) ||
    (limite !== null && !Number.isInteger(limite))
  ) {
    return { erro: "Confira os valores numéricos.", valores };
  }

  const resposta = await chamarComoAdmin("/cupons", {
    metodo: "POST",
    json: {
      codigo: valores.codigo,
      descricao: valores.descricao || null,
      tipo: TIPOS_DE_CUPOM.indexOf(valores.tipo as (typeof TIPOS_DE_CUPOM)[number]),
      valor,
      valorMinimoDoPedido: valorMinimo,
      // Válido até o fim do dia escolhido, no horário de Brasília.
      validoAteUtc: valores.validoAte
        ? new Date(`${valores.validoAte}T23:59:59-03:00`).toISOString()
        : null,
      limiteDeUsos: limite,
    },
  });

  if (!resposta.ok) return { erro: resposta.erro, campos: resposta.campos, valores };

  revalidatePath("/admin/cupons");
  return { sucesso: `Cupom ${valores.codigo.toUpperCase()} criado.` };
}

export async function alternarCupomAdmin(id: string, ativar: boolean): Promise<void> {
  await chamarComoAdmin(`/cupons/${encodeURIComponent(id)}/${ativar ? "ativar" : "inativar"}`, {
    metodo: "POST",
  });
  revalidatePath("/admin/cupons");
}
