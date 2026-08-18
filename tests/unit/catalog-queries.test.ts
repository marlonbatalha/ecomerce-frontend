import { describe, expect, it } from "vitest";
import {
  findCategoryBySlug,
  findProductBySlug,
  listCategories,
  listProducts,
} from "@/mocks/data/catalog-queries";

describe("listCategories", () => {
  it("retorna todas as categorias mockadas", () => {
    expect(listCategories().length).toBeGreaterThan(0);
  });
});

describe("findCategoryBySlug", () => {
  it("encontra uma categoria existente", () => {
    expect(findCategoryBySlug("eletronicos")?.name).toBe("Eletrônicos");
  });

  it("retorna null para slug inexistente", () => {
    expect(findCategoryBySlug("nao-existe")).toBeNull();
  });
});

describe("listProducts", () => {
  it("pagina o resultado (pageSize)", () => {
    const result = listProducts({ pageSize: 2, page: 1 });
    expect(result.items).toHaveLength(2);
    expect(result.total).toBeGreaterThan(2);
  });

  it("filtra por categoria", () => {
    const result = listProducts({ category: "moda", pageSize: 100 });
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items.every((p) => p.categorySlug === "moda")).toBe(true);
  });

  it("filtra por busca textual (nome ou descrição)", () => {
    const result = listProducts({ q: "bluetooth", pageSize: 100 });
    expect(result.items.some((p) => p.slug === "fone-de-ouvido-bluetooth")).toBe(true);
  });

  it("retorna lista vazia quando nada corresponde à busca", () => {
    const result = listProducts({ q: "produto-que-nao-existe-xyz" });
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });
});

describe("findProductBySlug", () => {
  it("encontra um produto existente", () => {
    expect(findProductBySlug("smartwatch-esportivo")?.name).toBe("Smartwatch Esportivo");
  });

  it("retorna null para slug inexistente", () => {
    expect(findProductBySlug("nao-existe")).toBeNull();
  });
});
