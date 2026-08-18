import { http, HttpResponse } from "msw";
import {
  findCategoryBySlug,
  findProductBySlug,
  listCategories,
  listProducts,
} from "@/mocks/data/catalog-queries";

export const catalogHandlers = [
  http.get("*/categories", () => {
    return HttpResponse.json(listCategories());
  }),

  http.get("*/categories/:slug", ({ params }) => {
    const category = findCategoryBySlug(String(params.slug));
    if (!category) {
      return HttpResponse.json({ message: "Categoria não encontrada" }, { status: 404 });
    }
    return HttpResponse.json(category);
  }),

  http.get("*/products", ({ request }) => {
    const url = new URL(request.url);
    const result = listProducts({
      category: url.searchParams.get("category") ?? undefined,
      q: url.searchParams.get("q") ?? undefined,
      page: Number(url.searchParams.get("page") ?? "1") || 1,
      pageSize: Number(url.searchParams.get("pageSize") ?? "") || undefined,
    });
    return HttpResponse.json(result);
  }),

  http.get("*/products/:slug", ({ params }) => {
    const product = findProductBySlug(String(params.slug));
    if (!product) {
      return HttpResponse.json({ message: "Produto não encontrado" }, { status: 404 });
    }
    return HttpResponse.json(product);
  }),
];
