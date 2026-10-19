import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getCategories, getProducts } from "@/lib/api/catalog";

/** Mesmo erro que o `fetch` do Node dá com a API fora do ar (ECONNREFUSED). */
const apiForaDoAr = () => Promise.reject(new TypeError("fetch failed"));

describe("catálogo com a API fora do ar", () => {
  beforeEach(() => {
    vi.stubEnv("BACKEND_URL", "http://localhost:5023");
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe("durante o next build", () => {
    beforeEach(() => {
      vi.stubEnv("NEXT_PHASE", "phase-production-build");
    });

    it("getCategories devolve lista vazia em vez de quebrar o build", async () => {
      vi.stubGlobal("fetch", vi.fn(apiForaDoAr));

      await expect(getCategories()).resolves.toEqual([]);
    });

    it("getProducts devolve página vazia em vez de quebrar o build", async () => {
      vi.stubGlobal("fetch", vi.fn(apiForaDoAr));

      await expect(getProducts({ pageSize: 100 })).resolves.toEqual({
        items: [],
        page: 1,
        pageSize: 100,
        total: 0,
        totalPages: 0,
      });
    });

    it("resposta de erro da API continua quebrando o build", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(() => Promise.resolve(new Response(null, { status: 500 }))),
      );

      await expect(getCategories()).rejects.toMatchObject({ status: 500 });
    });
  });

  it("em runtime o erro de rede continua subindo", async () => {
    vi.stubGlobal("fetch", vi.fn(apiForaDoAr));

    await expect(getCategories()).rejects.toThrow("fetch failed");
  });
});
