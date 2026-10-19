import { redirect } from "next/navigation";
import {
  mapearPedido,
  mapearResumo,
  paginado,
  type PedidoApi,
  type PedidoResumoApi,
  type ResultadoPaginadoApi,
} from "@/lib/api/pedidos";
import { chamarApi } from "@/lib/api/resposta";
import type { SessaoDoCliente } from "@/lib/auth/sessao";
import type { Endereco, Paginado, Pedido, PedidoResumo, Perfil } from "@/types/conta";

/**
 * Leituras da área do cliente (Server Components). Sempre sem cache: são dados de uma pessoa,
 * nunca podem ir pro cache compartilhado do Next. Mutações ficam em `conta-acoes.ts`.
 */

type PerfilApi = { id: string; nome: string; email: string };

type EnderecoApi = Omit<Endereco, "complemento"> & { complemento: string | null };

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
  return paginado(resultado, mapearResumo);
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
