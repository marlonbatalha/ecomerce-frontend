/** Carrinho vindo da API (`/api/v1/carrinho`) — a fonte da verdade é o servidor, não o browser. */

export type ItemDoCarrinho = {
  varianteId: string;
  nomeProduto: string;
  /** Só quando o produto tem mais de uma opção — senão não há o que distinguir. */
  nomeVariante?: string;
  slug: string;
  imagemUrl: string;
  precoUnitarioInCents: number;
  quantidade: number;
  subtotalInCents: number;
  /** 0 quando a variante foi inativada ou esgotou depois de entrar no carrinho. */
  estoqueDisponivel: number;
};

export type Carrinho = {
  itens: ItemDoCarrinho[];
  subtotalInCents: number;
  /** Soma das quantidades (é o número do ícone do carrinho). */
  quantidadeDeItens: number;
};

export type OpcaoDeFrete = {
  nome: string;
  precoInCents: number;
  prazoEmDiasUteis: number;
};
