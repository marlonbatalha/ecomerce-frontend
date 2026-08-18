import { http, HttpResponse } from "msw";

/**
 * Handlers compartilhados entre os mocks de browser (dev sem backend pronto)
 * e de testes (Vitest). Cada domínio (catálogo, carrinho, conta...) deve
 * exportar seus próprios handlers e agregá-los aqui conforme forem criados.
 */
export const handlers = [
  http.get("*/health", () => {
    return HttpResponse.json({ status: "ok" });
  }),
];
