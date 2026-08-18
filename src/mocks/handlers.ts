import { http, HttpResponse } from "msw";
import { catalogHandlers } from "@/mocks/handlers/catalog";

/**
 * Handlers compartilhados entre os mocks de browser (dev sem backend pronto),
 * SSR (ver src/instrumentation.ts) e testes (Vitest). Cada domínio (catálogo,
 * carrinho, conta...) exporta seus próprios handlers em `handlers/<domínio>.ts`
 * e os agrega aqui.
 */
export const handlers = [
  http.get("*/health", () => {
    return HttpResponse.json({ status: "ok" });
  }),
  ...catalogHandlers,
];
