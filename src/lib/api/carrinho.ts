import { chamarApi } from "@/lib/api/resposta";
import {
  identificarCarrinho,
  type IdentificacaoDoCarrinho,
} from "@/lib/carrinho/sessao-do-carrinho";
import type { Carrinho, OpcaoDeFrete } from "@/types/carrinho";

/** Mesmo placeholder do catálogo (`lib/api/catalog.ts`) — produto sem foto. */
const PLACEHOLDER_IMAGE = "/images/product-placeholder.svg";

export type ItemCarrinhoApi = {
  varianteDeProdutoId: string;
  nomeProduto: string;
  nomeVariante: string;
  precoUnitario: number;
  quantidade: number;
  subtotal: number;
  produtoSlug: string;
  imagemUrl: string | null;
  estoqueDisponivel: number;
  produtoTemOpcoes: boolean;
};

export type CarrinhoApi = { id: string; itens: ItemCarrinhoApi[]; total: number };

type MetodoDeEnvioApi = { nome: string; preco: number; prazoEmDiasUteis: number };

function centavos(valor: number): number {
  return Math.round(valor * 100);
}

export const CARRINHO_VAZIO: Carrinho = { itens: [], subtotalInCents: 0, quantidadeDeItens: 0 };

export function mapearCarrinho(carrinho: CarrinhoApi): Carrinho {
  const itens = carrinho.itens.map((item) => ({
    varianteId: item.varianteDeProdutoId,
    nomeProduto: item.nomeProduto,
    nomeVariante: item.produtoTemOpcoes ? item.nomeVariante : undefined,
    slug: item.produtoSlug,
    imagemUrl: item.imagemUrl ?? PLACEHOLDER_IMAGE,
    precoUnitarioInCents: centavos(item.precoUnitario),
    quantidade: item.quantidade,
    subtotalInCents: centavos(item.subtotal),
    estoqueDisponivel: item.estoqueDisponivel,
  }));

  return {
    itens,
    subtotalInCents: centavos(carrinho.total),
    quantidadeDeItens: itens.reduce((total, item) => total + item.quantidade, 0),
  };
}

/** Carrinho de quem está navegando (logado ou anônimo). Lê cookies: só em renderização dinâmica. */
export async function obterCarrinho(): Promise<Carrinho> {
  const identificacao = await identificarCarrinho();
  // Sem sessão e sem carrinho anônimo ainda: não há o que buscar (e a API criaria um à toa).
  if (!identificacao) return CARRINHO_VAZIO;
  return buscarCarrinho(identificacao);
}

export async function buscarCarrinho(identificacao: IdentificacaoDoCarrinho): Promise<Carrinho> {
  const resposta = await chamarApi<CarrinhoApi>("/carrinho", identificacao);
  if (!resposta.ok)
    throw new Error(`Falha ao buscar o carrinho: ${resposta.status} ${resposta.erro}`);
  return mapearCarrinho(resposta.dados);
}

/** Opções de envio pra um CEP — o valor final é recalculado pela API no checkout. */
export async function calcularFrete(cep: string, carrinho: Carrinho): Promise<OpcaoDeFrete[]> {
  if (carrinho.itens.length === 0) return [];

  const resposta = await chamarApi<MetodoDeEnvioApi[]>("/frete/calcular", {
    metodo: "POST",
    json: {
      cep,
      itens: carrinho.itens.map((i) => ({
        varianteDeProdutoId: i.varianteId,
        quantidade: i.quantidade,
      })),
    },
  });
  if (!resposta.ok) return [];

  return resposta.dados.map((o) => ({
    nome: o.nome,
    precoInCents: centavos(o.preco),
    prazoEmDiasUteis: o.prazoEmDiasUteis,
  }));
}
