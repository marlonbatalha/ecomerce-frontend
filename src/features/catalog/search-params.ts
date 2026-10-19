import type { ProductSort } from "@/types/catalog";

/** Itens por página nas listagens (`/produtos`, `/categorias/[slug]`). */
export const TAMANHO_PAGINA_CATALOGO = 12;

export const OPCOES_DE_ORDENACAO: { value: ProductSort; label: string }[] = [
  { value: "recentes", label: "Mais recentes" },
  { value: "menor-preco", label: "Menor preço" },
  { value: "maior-preco", label: "Maior preço" },
];

export type CatalogSearchParams = {
  page: number;
  sort: ProductSort;
  /** Em centavos; `undefined` quando o campo veio vazio ou inválido. */
  minPriceInCents?: number;
  maxPriceInCents?: number;
};

type SearchParamsBrutos = Record<string, string | string[] | undefined>;

function primeiro(valor: string | string[] | undefined): string | undefined {
  return Array.isArray(valor) ? valor[0] : valor;
}

/** "49,90" ou "49.90" (reais) → 4990. Vazio, negativo ou não numérico → `undefined`. */
function precoEmCentavos(valor: string | undefined): number | undefined {
  if (!valor?.trim()) return undefined;
  const numero = Number(valor.replace(",", "."));
  return Number.isFinite(numero) && numero >= 0 ? Math.round(numero * 100) : undefined;
}

/**
 * Lê página/ordenação/faixa de preço da URL. Valor inválido cai no padrão em vez de virar erro:
 * a URL é editável pelo visitante, e um `?pagina=abc` não merece uma página de erro.
 */
export function lerParametrosDoCatalogo(searchParams: SearchParamsBrutos): CatalogSearchParams {
  const pagina = Number(primeiro(searchParams.pagina));
  const ordem = primeiro(searchParams.ordem);

  return {
    page: Number.isInteger(pagina) && pagina > 0 ? pagina : 1,
    sort: OPCOES_DE_ORDENACAO.some((o) => o.value === ordem) ? (ordem as ProductSort) : "recentes",
    minPriceInCents: precoEmCentavos(primeiro(searchParams.precoMin)),
    maxPriceInCents: precoEmCentavos(primeiro(searchParams.precoMax)),
  };
}

/**
 * Monta o link de uma listagem mantendo os filtros atuais e trocando só o que vier em
 * `alteracoes` (`undefined` remove o parâmetro). Valores padrão (página 1, "recentes") saem da
 * URL pra não ter duas URLs pro mesmo conteúdo.
 */
export function montarLinkDoCatalogo(
  caminho: string,
  atuais: Record<string, string | undefined>,
  alteracoes: Record<string, string | undefined> = {},
): string {
  const params = new URLSearchParams();
  for (const [chave, valor] of Object.entries({ ...atuais, ...alteracoes })) {
    if (valor === undefined || valor === "") continue;
    if (chave === "pagina" && valor === "1") continue;
    if (chave === "ordem" && valor === "recentes") continue;
    params.set(chave, valor);
  }

  const qs = params.toString();
  return qs ? `${caminho}?${qs}` : caminho;
}

/** Centavos → texto pro campo de preço do formulário ("49.9" → "49,90"). */
export function centavosParaCampo(centavos: number | undefined): string {
  return centavos === undefined ? "" : (centavos / 100).toFixed(2).replace(".", ",");
}
