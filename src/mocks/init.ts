/**
 * Liga o mock de API no browser durante o desenvolvimento, para trabalhar no
 * catálogo/carrinho/etc. antes da API própria (backend) estar disponível.
 *
 * Uso (ex.: em `src/app/layout.tsx`, só em dev):
 *
 *   if (process.env.NODE_ENV === "development") {
 *     const { initMocks } = await import("@/mocks/init");
 *     await initMocks();
 *   }
 *
 * Controlado por `NEXT_PUBLIC_API_MOCKING=enabled` para poder ligar/desligar
 * sem mexer em código enquanto a API real for ficando disponível endpoint a
 * endpoint (ver seção 1.7 do plano).
 */

import { mockingEnabled } from "@/lib/api/mocking";

// Memoiza a promise de start: chamar `worker.start()` mais de uma vez (ex.:
// o double-invoke de efeitos do React Strict Mode em dev) faz o MSW lançar
// "cannot configure an already enabled network" na segunda chamada.
let startPromise: Promise<void> | undefined;

export function initMocks(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (!mockingEnabled()) return Promise.resolve();

  startPromise ??= import("./browser").then(async ({ worker }) => {
    await worker.start({ onUnhandledRequest: "bypass" });
  });
  return startPromise;
}
