import { http, HttpResponse } from "msw";

/**
 * Handlers do MSW usados só nos testes unitários (Vitest, ver `tests/unit/setup.ts`), que
 * bloqueia qualquer requisição de rede não mapeada aqui. O app não tem mais mock de API: catálogo,
 * conta, carrinho e checkout falam com a API própria de verdade (dados de exemplo no banco:
 * `sql/seed-produtos-exemplo.sql` no ecomerce-backend). Teste que precise de uma resposta da API
 * registra o próprio handler com `server.use(...)`.
 */
export const handlers = [
  http.get("*/health", () => {
    return HttpResponse.json({ status: "ok" });
  }),
];
