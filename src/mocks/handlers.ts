import { http, HttpResponse } from "msw";
import { catalogHandlers } from "@/mocks/handlers/catalog";
import { ordersHandlers } from "@/mocks/handlers/orders";

/**
 * Handlers compartilhados entre o mock de browser (dev sem backend pronto —
 * src/mocks/init.ts) e os testes (Vitest). Cada domínio (catálogo, carrinho,
 * conta...) exporta seus próprios handlers em `handlers/<domínio>.ts` e os
 * agrega aqui. Páginas/Server Components não passam por aqui: leem direto de
 * `src/mocks/data` via `src/lib/api/*` quando o mock está ligado — ver
 * comentário em `src/mocks/data/catalog-queries.ts`.
 */
export const handlers = [
  http.get("*/health", () => {
    return HttpResponse.json({ status: "ok" });
  }),
  ...catalogHandlers,
  ...ordersHandlers,
];
