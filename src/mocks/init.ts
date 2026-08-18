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
export async function initMocks() {
  if (typeof window === "undefined") return;
  if (process.env.NEXT_PUBLIC_API_MOCKING !== "enabled") return;

  const { worker } = await import("./browser");
  await worker.start({ onUnhandledRequest: "bypass" });
}
