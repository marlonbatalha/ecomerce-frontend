import { describe, expect, it } from "vitest";
import {
  centavosParaCampo,
  lerParametrosDoCatalogo,
  montarLinkDoCatalogo,
} from "@/features/catalog/search-params";

describe("lerParametrosDoCatalogo", () => {
  it("usa os padrões quando a URL não tem nada", () => {
    expect(lerParametrosDoCatalogo({})).toEqual({
      page: 1,
      sort: "recentes",
      minPriceInCents: undefined,
      maxPriceInCents: undefined,
    });
  });

  it("lê página, ordenação e preço em reais com vírgula ou ponto", () => {
    expect(
      lerParametrosDoCatalogo({
        pagina: "3",
        ordem: "menor-preco",
        precoMin: "49,90",
        precoMax: "100.5",
      }),
    ).toEqual({ page: 3, sort: "menor-preco", minPriceInCents: 4990, maxPriceInCents: 10050 });
  });

  it("ignora valores inválidos em vez de quebrar", () => {
    expect(
      lerParametrosDoCatalogo({ pagina: "abc", ordem: "qualquer", precoMin: "-5", precoMax: "x" }),
    ).toEqual({
      page: 1,
      sort: "recentes",
      minPriceInCents: undefined,
      maxPriceInCents: undefined,
    });
    expect(lerParametrosDoCatalogo({ pagina: "0" }).page).toBe(1);
    expect(lerParametrosDoCatalogo({ pagina: "2.5" }).page).toBe(1);
  });

  it("com parâmetro repetido, usa o primeiro", () => {
    expect(lerParametrosDoCatalogo({ pagina: ["2", "5"] }).page).toBe(2);
  });
});

describe("montarLinkDoCatalogo", () => {
  it("mantém os filtros atuais e troca só o que foi alterado", () => {
    expect(
      montarLinkDoCatalogo("/produtos", { q: "camisa", ordem: "maior-preco" }, { pagina: "2" }),
    ).toBe("/produtos?q=camisa&ordem=maior-preco&pagina=2");
  });

  it("tira da URL os valores padrão e os vazios", () => {
    expect(
      montarLinkDoCatalogo(
        "/produtos",
        { q: undefined, ordem: "recentes", precoMin: "" },
        { pagina: "1" },
      ),
    ).toBe("/produtos");
  });

  it("remove um parâmetro passado como undefined", () => {
    expect(
      montarLinkDoCatalogo("/produtos", { q: "camisa", categoria: "moda" }, { q: undefined }),
    ).toBe("/produtos?categoria=moda");
  });
});

describe("centavosParaCampo", () => {
  it("formata em reais com vírgula", () => {
    expect(centavosParaCampo(4990)).toBe("49,90");
    expect(centavosParaCampo(undefined)).toBe("");
  });
});
